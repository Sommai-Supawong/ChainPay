"use client";
import { T, useErrorTranslation, useTranslation } from "@/i18n";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, friendlyError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { GlassCard, LoadingState, StatusAlert, StatusBadge, WalletAddress } from "@/components/ui/primitives";
import { ConnectWallet } from "@/components/wallet/connect-wallet";
import { fromWei, parseWeiString } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useConnection, useWriteContract, usePublicClient } from "wagmi";
import { chain, escrowContractAddress } from "@/lib/blockchain/config";
import { chainPayEscrowAbi } from "@/lib/blockchain/chainpay-escrow-abi";
import { keccak256, toHex } from "viem";
import type { EscrowModel, EscrowMilestoneModel } from "@/types/models";

export function EscrowDetail({ id, currentUserId }: { id: string; currentUserId: string }) {
  const t = useTranslation();
  const errorText = useErrorTranslation();
  const cache = useQueryClient();

  const account = useConnection();
  const write = useWriteContract();
  const publicClient = usePublicClient();

  const [busy, setBusy] = useState("");
  const [verifying, setVerifying] = useState<string | null>(null);
  const [submittingMilestone, setSubmittingMilestone] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["escrow", id],
    queryFn: () => api<EscrowModel>(`escrows/${id}`),
    refetchInterval: verifying ? 3_000 : 10_000,
  });

  useEffect(() => {
    if (!verifying) return;
    const interval = setInterval(async () => {
      try {
        const res = await api< { status: string; reason?: string }>(`escrow-transactions/${verifying}/verify`, { method: "POST" });
        if (res.status === "confirmed") {
          toast.success(t("Transaction verified successfully on Sepolia!"));
          setVerifying(null);
          cache.invalidateQueries({ queryKey: ["escrow", id] });
        } else if (res.status === "failed") {
          toast.error(t("Transaction failed on Sepolia."));
          setVerifying(null);
        }
      } catch {
        // if 503 keep trying
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [verifying, id, cache, t]);


  if (query.isPending) return <LoadingState text="Loading contract…" />;
  if (query.error || !query.data)
    return (
      <StatusAlert tone="error" title="Unable to load contract">
        {query.error ? errorText(query.error.message) : t("Contract not found.")}
      </StatusAlert>
    );

  const e = query.data;
  const onChainEscrowId = keccak256(toHex(e.id));
  
  const isClient = e.clientId === currentUserId;
  const isFreelancer = e.freelancerId === currentUserId || account.address?.toLowerCase() === e.freelancerAddress.toLowerCase();

  async function handleAction(
    type: "deposit" | "release" | "refund" | "dispute_resolved",
    funcName: "fund" | "release" | "refund",
    args:
      | readonly [`0x${string}`, `0x${string}`, readonly bigint[]]
      | readonly [`0x${string}`, bigint]
      | readonly [`0x${string}`],
    value: bigint,
    milestoneId?: string,
  ) {
    if (!account.address || account.chainId !== chain.id) {
      toast.error(t("Please switch to Ethereum Sepolia."));
      return;
    }
    setBusy(t("Waiting for MetaMask..."));
    try {
      let hash: `0x${string}`;

      // --- SIMULATION & GAS ESTIMATION ---
      if (!publicClient) throw new Error("Public client not found");
      
      console.log(`[DEBUG] Estimating gas for: ${funcName}`, {
        chainId: chain.id,
        contract: escrowContractAddress(),
        account: account.address,
        escrowId: e.id,
        value: value,
        args
      });

      let estimatedGas: bigint;
      try {
        estimatedGas = await publicClient.estimateContractGas({
          address: escrowContractAddress(),
          abi: chainPayEscrowAbi,
          functionName: funcName,
          args: args,
          value: value > BigInt(0) ? value : undefined,
          account: account.address as `0x${string}`
        } as never);
      } catch (err: unknown) {
        console.error("[DEBUG] estimateContractGas failed:", err);
        const errMessage = err instanceof Error ? err.message : String(err);
        toast.error(errorText(friendlyError(errMessage || "Simulation failed. Transaction will revert.")));
        return false; // finally block will clear busy
      }

      const gasWithBuffer = (estimatedGas * BigInt(120)) / BigInt(100);
      console.log(`[DEBUG] estimatedGas: ${estimatedGas}, gasWithBuffer: ${gasWithBuffer}`);

      if (gasWithBuffer >= BigInt(16777216)) {
        toast.error(t("Transaction gas limit exceeds network capacity."));
        return false;
      }
      // ------------------------------------

      if (funcName === "fund") {
        hash = await write.mutateAsync({
          address: escrowContractAddress(),
          abi: chainPayEscrowAbi,
          functionName: "fund",
          args: args as readonly [`0x${string}`, `0x${string}`, readonly bigint[]],
          value,
          gas: gasWithBuffer,
          chainId: chain.id,
          account: account.address,
        });
      } else if (funcName === "release") {
        hash = await write.mutateAsync({
          address: escrowContractAddress(),
          abi: chainPayEscrowAbi,
          functionName: "release",
          args: args as readonly [`0x${string}`, bigint],
          gas: gasWithBuffer,
          chainId: chain.id,
          account: account.address,
        });
      } else {
        hash = await write.mutateAsync({
          address: escrowContractAddress(),
          abi: chainPayEscrowAbi,
          functionName: "refund",
          args: args as readonly [`0x${string}`],
          gas: gasWithBuffer,
          chainId: chain.id,
          account: account.address,
        });
      }
      await api("escrow-transactions", { method: "POST", body: { escrowId: e.id, hash, type, milestoneId } });
      setVerifying(hash);
      toast.success(t("Transaction submitted. Waiting for confirmation..."));
      return true;
    } catch (error) {
      toast.error(errorText(friendlyError(error)));
      return false;
    } finally {
      setBusy("");
    }
  }

  async function fundEscrow() {
    if (busy) return;
    await handleAction(
      "deposit",
      "fund",
      [
        onChainEscrowId,
        e.freelancerAddress as `0x${string}`,
        e.milestones.map((m) => parseWeiString(m.amount)),
      ],
      parseWeiString(e.totalAmount),
    );
  }

  async function submitMilestoneForm(event: React.FormEvent<HTMLFormElement>, milestoneId: string) {
    event.preventDefault();
    if (busy) return;
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const evidenceUrl = formData.get("evidenceUrl") as string;
    
    if (!title || !description) {
        toast.error(t("Submission title and description are required."));
        return;
    }
    setBusy(t("Submitting..."));
    try {
      await api(`escrows/${id}/milestones/${milestoneId}/submit`, { method: "POST", body: { title, description, evidenceUrl } });
      await cache.invalidateQueries({ queryKey: ["escrow", id] });
      toast.success(t("Work submitted successfully."));
      setSubmittingMilestone(null);
    } catch (error) {
      toast.error(errorText(friendlyError(error)));
    } finally {
        setBusy("");
    }
  }

  async function approveAndReleaseMilestone(m: EscrowMilestoneModel, index: number) {
    if (busy) return;
    
    // 1. Trigger metamask release on-chain immediately from user action
    const success = await handleAction("release", "release", [onChainEscrowId, BigInt(index)], BigInt(0), m.id);
    
    if (success && m.status === "submitted") {
      try {
        // 2. Server-side approval check and DB update (marks DB as APPROVED)
        await api(`escrows/${id}/milestones/${m.id}/approve`, { method: "POST" });
        await cache.invalidateQueries({ queryKey: ["escrow", id] });
      } catch {
        // It will eventually be marked released via verification anyway
      }
    }
  }

  async function refundEscrow() {
    if (busy) return;
    await handleAction("refund", "refund", [onChainEscrowId], BigInt(0));
  }

  async function markDisputed() {
    if (busy) return;
    try {
      await api(`escrows/${id}/dispute`, { method: "POST" });
      await cache.invalidateQueries({ queryKey: ["escrow", id] });
      toast.success(t("Escrow marked as disputed"));
    } catch (error) {
      toast.error(errorText(friendlyError(error)));
    }
  }


  return (
    <div className="stack">
      <ConnectWallet />
      <GlassCard className="request-detail">
        <div className="card-heading">
          <p className="eyebrow">
            <T value="ESCROW CONTRACT" />
          </p>
          <StatusBadge status={e.status} />
        </div>
        <h2>{e.title}</h2>
        <div className="review-amount">
          {fromWei(e.totalAmount)}
          <span>
            <T value="ETH" />
          </span>
        </div>
        <p className="muted">{e.description}</p>
        
        <dl className="detail-list" style={{ marginTop: "2rem" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <p className="eyebrow"><T value="ESCROW PARTIES" /></p>
          </div>
          <div>
            <dt><T value="Client" /></dt>
            <dd>{e.clientAddress ? <WalletAddress address={e.clientAddress} full /> : <T value="Unknown" />}</dd>
          </div>
          <div>
            <dt><T value="Freelancer" /></dt>
            <dd><WalletAddress address={e.freelancerAddress} full /></dd>
          </div>
          <div style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
            <dt><T value="Contract status" /></dt>
            <dd><StatusBadge status={e.status} /></dd>
          </div>
        </dl>
        
        {verifying && (
          <div className="card" style={{ marginTop: "1rem", padding: "1rem", background: "var(--background)" }}>
            <p className="small"><T value="Transaction Pending" /></p>
            <p className="small muted"><T value="Waiting for Sepolia confirmation..." /></p>
            <WalletAddress address={verifying} full />
          </div>
        )}

        <div className="button-row" style={{ marginTop: "2rem" }}>
          {e.status === "created" && isClient && (
            <Button disabled={Boolean(busy)} onClick={fundEscrow}>
              {busy || t("Fund Escrow")}
            </Button>
          )}
          {e.status === "funded" && isClient && (
             <Button variant="secondary" disabled={Boolean(busy)} onClick={refundEscrow}>
               {busy || t("Refund")}
             </Button>
          )}
          {e.status !== "disputed" && e.status !== "refunded" && e.status !== "released" && e.status !== "created" && (isClient || isFreelancer) && (
            <Button variant="secondary" disabled={Boolean(busy)} onClick={markDisputed}>
              {busy || t("Open Dispute")}
            </Button>
          )}
        </div>
      </GlassCard>

      <h3><T value="Milestone Timeline" /></h3>
      <div className="stack">
        {e.milestones.map((m: EscrowMilestoneModel, index: number) => (
          <GlassCard key={m.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4>{m.title}</h4>
              <StatusBadge status={m.status} />
            </div>
            <p className="muted" style={{ margin: "0.5rem 0" }}>{m.description}</p>
            <div style={{ fontWeight: 600, margin: "1rem 0" }}>
              {fromWei(m.amount)}{" "}
              <span>
                <T value="ETH" />
              </span>
            </div>
            
            {m.submission && (
                <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                    <p className="eyebrow" style={{ marginBottom: "0.5rem" }}><T value="Your Submission" /></p>
                    <div style={{ fontWeight: 600 }}>{m.submission.title}</div>
                    <p className="muted" style={{ margin: "0.5rem 0" }}>{m.submission.description}</p>
                    {m.submission.evidenceUrl && (
                        <div style={{ marginTop: "0.5rem" }}>
                            <a href={m.submission.evidenceUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "underline" }}>
                                {m.submission.evidenceUrl}
                            </a>
                        </div>
                    )}
                    {m.status === "submitted" && <p className="muted small" style={{ marginTop: "1rem" }}><T value="Waiting for client review." /></p>}
                </div>
            )}

            {submittingMilestone === m.id ? (
                <form className="stack" style={{ marginTop: "1rem", padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius)" }} onSubmit={(e) => submitMilestoneForm(e, m.id)}>
                    <h4><T value="Submit Work" /></h4>
                    
                    <div className="input-group">
                        <label><T value="Submission Title" /></label>
                        <input name="title" required disabled={Boolean(busy)} placeholder={t("e.g. Homepage UI completed")} />
                    </div>

                    <div className="input-group">
                        <label><T value="Description" /></label>
                        <textarea name="description" required disabled={Boolean(busy)} placeholder={t("Describe what you completed...")} rows={3} />
                    </div>

                    <div className="input-group">
                        <label><T value="Evidence URL" /></label>
                        <input name="evidenceUrl" type="url" disabled={Boolean(busy)} placeholder="https://..." />
                    </div>

                    <div className="button-row" style={{ marginTop: "1rem" }}>
                        <Button variant="secondary" type="button" onClick={() => setSubmittingMilestone(null)} disabled={Boolean(busy)}><T value="Cancel" /></Button>
                        <Button type="submit" disabled={Boolean(busy)}>{busy || t("Submit Work")}</Button>
                    </div>
                </form>
            ) : (
                <div className="button-row" style={{ marginTop: "1rem" }}>
                {m.status === "pending" && e.status !== "created" && e.status !== "disputed" && isFreelancer && (
                    <Button onClick={() => setSubmittingMilestone(m.id)}>
                    {t("Submit Work")}
                    </Button>
                )}
                {(m.status === "submitted" || m.status === "approved") && e.status === "funded" && isClient && (
                    <Button disabled={Boolean(busy)} onClick={() => approveAndReleaseMilestone(m, index)}>
                    {busy || (m.status === "approved" ? t("Retry Release") : t("Approve & Release"))}
                    </Button>
                )}
                </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
