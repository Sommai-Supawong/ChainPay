"use client";
import { T, useTranslation } from "@/i18n";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConnection, usePublicClient, useWriteContract } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatEther, parseEther, type Hex } from "viem";
import { ArrowRight, ShieldCheck, ArrowLeft, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { api, friendlyError } from "@/lib/client-api";
import {
  chain,
  chainPayAbi,
  explorerTx,
  contractAddress,
  ACTIVE_CONTRACT_VERSION,
} from "@/lib/blockchain/config";
import { paymentSchema, type PaymentInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Field, GlassCard, WalletAddress } from "@/components/ui/primitives";
import { ConnectWallet } from "@/components/wallet/connect-wallet";
import { CopyButton } from "@/components/ui/copy-button";
import { WalletBalance } from "@/components/wallet/wallet-manager";
import type { ContactModel, IntentModel } from "@/types/models";

type Review = { intent: IntentModel; fee: bigint; note: string };
type Submission = { intentId: string; token: string; hash: Hex };
export function PaymentForm({
  request,
  recipient = "",
}: {
  request?: { slug: string; receiver: string; amount: string; title: string };
  recipient?: string;
}) {
  const t = useTranslation();
  const router = useRouter();
  const account = useConnection(),
    client = usePublicClient({ chainId: chain.id }),
    write = useWriteContract();
  const [review, setReview] = useState<Review | null>(null),
    [submission, setSubmission] = useState<Submission | null>(null),
    [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  const form = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      toAddress: request?.receiver ?? recipient,
      amount: request ? formatEther(parseEther(request.amount)) : "",
      title: request?.title ?? "",
      note: "",
    },
  });
  const contacts = useQuery({
    queryKey: ["contacts"],
    queryFn: () => api<ContactModel[]>("contacts"),
    enabled: !request,
  });
  async function prepare(input: PaymentInput) {
    setError("");
    setBusy(t("Preparing your payment…"));
    try {
      if (!account.address || account.chainId !== chain.id || !client)
        throw new Error("Connect your wallet and switch to Ethereum Sepolia.");
      const intent = await api<IntentModel>("payment-intents", {
        method: "POST",
        body: { ...input, fromAddress: account.address, slug: request?.slug },
      });
      if (
        intent.contractVersion !== ACTIVE_CONTRACT_VERSION ||
        intent.contract.toLowerCase() !== contractAddress().toLowerCase()
      )
        throw new Error(
          "The active ChainPay contract changed. Reload and prepare a new payment.",
        );
      const gas = await client.estimateContractGas({
        address: intent.contract,
        abi: chainPayAbi,
        functionName: "pay",
        args: [intent.paymentId, intent.toAddress],
        account: account.address,
        value: parseEther(intent.amount),
      });
      const [gasPrice, balance] = await Promise.all([
        client.getGasPrice(),
        client.getBalance({ address: account.address }),
      ]);
      const fee = (gas * gasPrice * BigInt(120)) / BigInt(100);
      if (balance < parseEther(intent.amount) + fee)
        throw new Error(
          "Your wallet needs enough ETH for this payment and its estimated network fee.",
        );
      setReview({ intent, fee, note: input.note });
    } catch (err) {
      setError(t(friendlyError(err)));
    } finally {
      setBusy("");
    }
  }
  async function persist(value: Submission) {
    setBusy(t("Saving your submitted transaction…"));
    try {
      await api("transactions", { method: "POST", body: value });
      sessionStorage.removeItem("chainpay-submission");
      router.push(`/tx/${value.hash}`);
    } catch (err) {
      setError(
        `${t(friendlyError(err))} ${t("Your transaction was already broadcast. Retry saving; do not pay again.")}`,
      );
    } finally {
      setBusy("");
    }
  }
  async function pay() {
    if (!review) return;
    setError("");
    setBusy(t("Waiting for MetaMask…"));
    try {
      const i = review.intent;
      if (
        i.contractVersion !== ACTIVE_CONTRACT_VERSION ||
        i.contract.toLowerCase() !== contractAddress().toLowerCase()
      )
        throw new Error(
          "The active ChainPay contract changed. Reload and prepare a new payment.",
        );
      if (
        account.address?.toLowerCase() !== i.fromAddress.toLowerCase() ||
        account.chainId !== chain.id
      )
        throw new Error(
          "Your wallet or network changed. Go back and review the payment again.",
        );
      if (Date.now() >= new Date(i.expiresAt).getTime())
        throw new Error(
          "Your review expired. Go back and prepare a new review.",
        );
      if (request) {
        const latest = await api<{ status: string }>(`public/${request.slug}`);
        if (latest.status !== "active")
          throw new Error("This request is no longer available for payment.");
      }
      const hash = await write.mutateAsync({
        address: i.contract,
        abi: chainPayAbi,
        functionName: "pay",
        args: [i.paymentId, i.toAddress],
        value: parseEther(i.amount),
        chainId: chain.id,
        account: account.address,
      });
      const value = { intentId: i.id, token: i.token, hash };
      setSubmission(value);
      try {
        sessionStorage.setItem("chainpay-submission", JSON.stringify(value));
      } catch {
        toast.error(t("Keep this transaction hash until it has been saved."));
      }
      await persist(value);
    } catch (err) {
      setError(t(friendlyError(err)));
    } finally {
      setBusy("");
    }
  }
  const changed =
    review &&
    (account.address?.toLowerCase() !==
      review.intent.fromAddress.toLowerCase() ||
      account.chainId !== chain.id);
  return (
    <GlassCard className="payment-form">
      <ol className="payment-progress" aria-label={t("Payment progress")}>
        {["Details", "Review", "Confirmation"].map((label, index) => (
          <li
            key={label}
            aria-current={
              index === (submission ? 2 : review ? 1 : 0) ? "step" : undefined
            }
          >
            <span aria-hidden="true">{index + 1}</span>
            <span>{t(label)}</span>
          </li>
        ))}
      </ol>
      <div className="card-heading">
        <div>
          <h2>
            {t(
              submission
                ? "Transaction submitted"
                : review
                  ? "A moment to double-check."
                  : "Where are we sending?",
            )}
          </h2>
        </div>
        <span className="badge">
          <T value="Sepolia ETH" />
        </span>
      </div>
      <ConnectWallet />
      {account.address && (
        <p className="small muted">
          <T value="Available on Sepolia:" />
          <WalletBalance address={account.address} />
        </p>
      )}
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      {submission ? (
        <div className="stack">
          <p>
            <T value="Your transaction has been broadcast. Save it to track confirmation." />
          </p>
          <WalletAddress address={submission.hash} full />
          <div className="button-row">
            <CopyButton value={submission.hash} />
            <Button asChild variant="ghost">
              <a
                target="_blank"
                rel="noreferrer"
                href={explorerTx(submission.hash)}
              >
                <T value="Explorer" />
                <ExternalLink size={16} />
              </a>
            </Button>
          </div>
          <Button disabled={Boolean(busy)} onClick={() => persist(submission)}>
            {busy || t("Retry saving transaction")}
          </Button>
        </div>
      ) : review ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="review"
        >
          <div className="review-amount">
            {formatEther(parseEther(review.intent.amount))}
            <span>
              <T value="ETH" />
            </span>
          </div>
          <dl className="detail-list">
            <div>
              <dt>
                <T value="From" />
              </dt>
              <dd>
                <WalletAddress address={review.intent.fromAddress} full />
              </dd>
            </div>
            <div>
              <dt>
                <T value="To" />
              </dt>
              <dd>
                <WalletAddress address={review.intent.toAddress} full />
              </dd>
            </div>
            <div>
              <dt>
                <T value="Network" />
              </dt>
              <dd>
                <T value="Ethereum Sepolia" />
              </dd>
            </div>
            <div>
              <dt>
                <T value="Estimated network fee" />
              </dt>
              <dd>
                {formatEther(review.fee)} <T value="ETH" />
              </dd>
            </div>
            <div>
              <dt>
                <T value="Estimated total" />
              </dt>
              <dd>
                {formatEther(parseEther(review.intent.amount) + review.fee)}{" "}
                <T value="ETH" />
              </dd>
            </div>
            {review.intent.title && (
              <div>
                <dt>
                  <T value="For" />
                </dt>
                <dd>{review.intent.title}</dd>
              </div>
            )}
            {review.note && (
              <div>
                <dt>
                  <T value="Private note" />
                </dt>
                <dd>{review.note}</dd>
              </div>
            )}
          </dl>
          <p className="small muted">
            <T value="Fee includes a 20% estimate buffer. MetaMask shows the final fee. Confirm the recipient carefully; transfers cannot be undone." />
          </p>
          {changed && (
            <p role="alert" className="field-error">
              <T value="Wallet changed. Go back and review again." />
            </p>
          )}
          <div className="button-row">
            <Button
              variant="secondary"
              disabled={Boolean(busy)}
              onClick={() => setReview(null)}
            >
              <ArrowLeft size={16} />
              <T value="Back" />
            </Button>
            <Button disabled={Boolean(busy) || Boolean(changed)} onClick={pay}>
              {busy || t("Confirm & pay")}
              <ArrowRight size={16} />
            </Button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={form.handleSubmit(prepare)} className="stack">
          {!request && Boolean(contacts.data?.length) && (
            <Field name="contact" label="Saved contact">
              <select
                id="contact"
                defaultValue=""
                onChange={(e) =>
                  form.setValue("toAddress", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="" disabled>
                  <T value="Choose a contact" />
                </option>
                {contacts.data?.map((c) => (
                  <option key={c.id} value={c.walletAddress}>
                    {c.name} · {c.label}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field
            name="toAddress"
            label="Recipient wallet"
            error={form.formState.errors.toAddress?.message}
          >
            <input
              id="toAddress"
              className="technical-text"
              placeholder="0x…"
              readOnly={Boolean(request)}
              {...form.register("toAddress")}
              autoComplete="off"
            />
          </Field>
          <Field
            name="amount"
            label="Amount · ETH"
            error={form.formState.errors.amount?.message}
            hint="Sepolia test ETH only. Network fee is calculated in the next step."
          >
            <input
              id="amount"
              inputMode="decimal"
              placeholder="0.00"
              className="amount-input"
              readOnly={Boolean(request)}
              {...form.register("amount")}
            />
          </Field>
          <Field
            name="title"
            label="Payment title (optional)"
            error={form.formState.errors.title?.message}
          >
            <input
              id="title"
              placeholder={t("What’s this payment for?")}
              readOnly={Boolean(request)}
              {...form.register("title")}
            />
          </Field>
          {!request && (
            <Field
              name="note"
              label="Private note (optional)"
              error={form.formState.errors.note?.message}
            >
              <textarea
                id="note"
                placeholder={t("Just for your records")}
                {...form.register("note")}
              />
            </Field>
          )}
          <Button
            disabled={
              Boolean(busy) || !account.address || account.chainId !== chain.id
            }
            type="submit"
          >
            {busy || t("Review payment")}
            <ArrowRight size={17} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              try {
                const raw = sessionStorage.getItem("chainpay-submission");
                if (!raw) {
                  toast.info(t("No unsaved transaction in this tab."));
                  return;
                }
                const value = JSON.parse(raw) as Submission;
                setSubmission(value);
              } catch {
                toast.error(
                  t("Could not recover the transaction from this tab."),
                );
              }
            }}
          >
            <T value="Recover a submitted payment" />
          </Button>
        </form>
      )}
      <div className="security-note">
        <ShieldCheck size={18} />
        <p>
          <T value="Your wallet signs. Ethereum settles. ChainPay verifies." />
        </p>
      </div>
      {!request && (
        <p className="small muted">
          <T value="Wallet not verified yet?" />{" "}
          <Link className="text-link" href="/wallets">
            <T value="Manage wallets" />
          </Link>
        </p>
      )}
    </GlassCard>
  );
}
