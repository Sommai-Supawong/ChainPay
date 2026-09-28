"use client";
import { T, useTranslation } from "@/i18n";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useConnection, useSignMessage, useBalance } from "wagmi";
import { formatEther } from "viem";
import { ExternalLink, ShieldCheck, Star, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { api, friendlyError } from "@/lib/client-api";
import { chain, explorerAddress } from "@/lib/blockchain/config";
import { Button } from "@/components/ui/button";
import {
  GlassCard,
  EmptyState,
  LoadingState,
  StatusBadge,
  WalletAddress,
} from "@/components/ui/primitives";
import { CopyButton } from "@/components/ui/copy-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ConnectWallet } from "./connect-wallet";
import type { WalletModel } from "@/types/models";
export function WalletBalance({ address }: { address: `0x${string}` }) {
  const t = useTranslation();
  const balance = useBalance({ address, chainId: chain.id });
  return (
    <span>
      {balance.isPending
        ? t("Loading balance…")
        : balance.error
          ? t("Balance unavailable")
          : `${formatEther(balance.data?.value ?? BigInt(0))} ETH`}
    </span>
  );
}
export function WalletManager() {
  const t = useTranslation();
  const { address, chainId } = useConnection(),
    sign = useSignMessage(),
    query = useQueryClient();
  const [busy, setBusy] = useState(false);
  const wallets = useQuery({
    queryKey: ["wallets"],
    queryFn: () => api<WalletModel[]>("wallets"),
  });
  async function mutate(id: string, method: "PATCH" | "DELETE") {
    try {
      await api(`wallets/${id}`, { method });
      await query.invalidateQueries({ queryKey: ["wallets"] });
      toast.success(
        t(method === "DELETE" ? "Wallet removed" : "Primary wallet updated"),
      );
    } catch (error) {
      toast.error(t(friendlyError(error)));
    }
  }
  async function verify() {
    if (!address) return;
    setBusy(true);
    try {
      const challenge = await api<{ id: string; message: string }>(
        "wallets/challenge",
        { method: "POST", body: { address } },
      );
      const signature = await sign.mutateAsync({ message: challenge.message });
      await api("wallets/verify", {
        method: "POST",
        body: { id: challenge.id, signature },
      });
      await query.invalidateQueries({ queryKey: ["wallets"] });
      toast.success(t("Wallet ownership verified"));
    } catch (error) {
      toast.error(t(friendlyError(error)));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stack">
      <GlassCard>
        <div className="card-heading">
          <div>
            <h2>
              <T value="Connect your wallet" />
            </h2>
            <p className="muted">
              <T value="A connection lets you pay. A signature proves the wallet is yours." />
            </p>
          </div>
          <Wallet className="muted" />
        </div>
        <ConnectWallet />
        {address &&
          !wallets.data?.some(
            (w) => w.address.toLowerCase() === address.toLowerCase(),
          ) && (
            <div className="verification-prompt">
              <p>
                <T value="Verify this wallet to link it to your ChainPay account. This signature does not move funds." />
              </p>
              <Button disabled={busy || chainId !== chain.id} onClick={verify}>
                <ShieldCheck size={17} />
                {t(busy ? "Verifying wallet…" : "Verify ownership")}
              </Button>
            </div>
          )}
      </GlassCard>
      {wallets.isPending ? (
        <LoadingState text="Loading wallets…" />
      ) : wallets.error ? (
        <p role="alert" className="field-error">
          {t(wallets.error.message)}
        </p>
      ) : !wallets.data?.length ? (
        <GlassCard>
          <EmptyState
            title="Your wallets belong here"
            description="Connect MetaMask and sign a verification message to add your first wallet."
          />
        </GlassCard>
      ) : (
        <div className="wallet-grid">
          {wallets.data.map((wallet) => (
            <GlassCard key={wallet.id}>
              <div className="card-heading">
                <div className="feature-icon">
                  <Wallet size={22} />
                </div>
                <StatusBadge
                  status={wallet.isPrimary ? "primary" : "verified"}
                />
              </div>
              <h3>{wallet.label}</h3>
              <WalletAddress address={wallet.address} full />
              <div className="wallet-balance">
                <WalletBalance address={wallet.address} />
              </div>
              <div className="small muted">
                <T value="Verified · Ethereum Sepolia" />
              </div>
              <div className="button-row">
                <CopyButton value={wallet.address} label="Address" />
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={explorerAddress(wallet.address)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={15} />
                    <T value="Explorer" />
                  </a>
                </Button>
              </div>
              <div className="card-actions">
                {!wallet.isPrimary && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => mutate(wallet.id, "PATCH")}
                  >
                    <Star size={15} />
                    <T value="Set primary" />
                  </Button>
                )}
                <ConfirmDialog
                  title="Remove this wallet?"
                  description="Your payment history will stay available. Open requests must be resolved first."
                  trigger={
                    <Button variant="ghost" size="sm">
                      <Trash2 size={15} />
                      <T value="Remove" />
                    </Button>
                  }
                  onConfirm={() => mutate(wallet.id, "DELETE")}
                />
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
