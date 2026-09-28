"use client";
import { T, useLocale, useTranslation } from "@/i18n";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock3, ExternalLink, RefreshCw, CircleX } from "lucide-react";
import { api } from "@/lib/client-api";
import { explorerTx } from "@/lib/blockchain/config";
import { eth } from "@/lib/utils";
import {
  GlassCard,
  LoadingState,
  WalletAddress,
  StatusBadge,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import type { ReceiptModel } from "@/types/models";
export function Receipt({ hash }: { hash: string }) {
  const t = useTranslation();
  const locale = useLocale();
  const cache = useQueryClient();
  const receipt = useQuery({
    queryKey: ["receipt", hash],
    queryFn: () => api<ReceiptModel>(`transactions/${hash}`),
  });
  const verification = useQuery({
    queryKey: ["verify", hash],
    queryFn: () =>
      api<{ status: string }>(`transactions/${hash}/verify`, {
        method: "POST",
      }),
    enabled: receipt.data?.status === "pending",
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 12_000 : false,
    retry: 1,
  });
  useEffect(() => {
    if (verification.data && verification.data.status !== "pending") {
      void cache.invalidateQueries({ queryKey: ["receipt", hash] });
      void cache.invalidateQueries({ queryKey: ["transactions"] });
    }
  }, [verification.data, hash, cache]);
  if (receipt.isPending)
    return <LoadingState text="Loading payment receipt…" />;
  if (receipt.error || !receipt.data)
    return (
      <GlassCard>
        <h2>
          <T value="Receipt unavailable" />
        </h2>
        <p className="muted">
          {receipt.error?.message && t(receipt.error.message)}
        </p>
        <Button variant="secondary" onClick={() => receipt.refetch()}>
          <T value="Try again" />
        </Button>
      </GlassCard>
    );
  const data = receipt.data;
  return (
    <GlassCard className="receipt-card">
      <div className={`receipt-icon ${data.status}`}>
        {data.status === "confirmed" ? (
          <Check />
        ) : data.status === "failed" ? (
          <CircleX />
        ) : (
          <Clock3 />
        )}
      </div>
      <p className="eyebrow">
        <T value="PAYMENT RECEIPT" />
      </p>
      <h1>
        {t(
          data.status === "confirmed"
            ? "Payment confirmed."
            : data.status === "failed"
              ? "Payment failed."
              : "On its way.",
        )}
      </h1>
      <p className="muted">
        {t(
          data.status === "confirmed"
            ? "Verified independently on Ethereum."
            : data.status === "failed"
              ? "Ethereum reverted this transaction. Network fees may still apply."
              : "Submitted to Ethereum. Waiting for server verification.",
        )}
      </p>
      <div className="review-amount">
        {eth(data.amount)}
        <span>
          <T value="ETH" />
        </span>
      </div>
      <StatusBadge status={data.status} />
      <dl className="detail-list">
        <div>
          <dt>
            <T value="For" />
          </dt>
          <dd>{data.title}</dd>
        </div>
        <div>
          <dt>
            <T value="From" />
          </dt>
          <dd>
            <WalletAddress address={data.fromAddress} full />
          </dd>
        </div>
        <div>
          <dt>
            <T value="To" />
          </dt>
          <dd>
            <WalletAddress address={data.toAddress} full />
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
            <T value="Transaction" />
          </dt>
          <dd>
            <WalletAddress address={data.txHash} full />
          </dd>
        </div>
        <div>
          <dt>
            <T value="Block" />
          </dt>
          <dd>{data.blockNumber ?? t("Awaiting confirmation")}</dd>
        </div>
        <div>
          <dt>
            <T value="Confirmed at" />
          </dt>
          <dd>
            {data.confirmedAt
              ? new Date(data.confirmedAt).toLocaleString(locale)
              : t("Not confirmed")}
          </dd>
        </div>
        {data.note && (
          <div>
            <dt>
              <T value="Private note" />
            </dt>
            <dd>{data.note}</dd>
          </div>
        )}
      </dl>
      {verification.error && (
        <p className="field-error" role="alert">
          <T value="Verification is temporarily unavailable. Your payment has not been marked confirmed." />
        </p>
      )}
      <div className="button-row">
        <Button asChild variant="secondary">
          <a href={explorerTx(hash)} target="_blank" rel="noreferrer">
            <T value="View on explorer" />
            <ExternalLink size={16} />
          </a>
        </Button>
        <CopyButton value={hash} label="Transaction hash" />
        {data.status === "pending" && (
          <Button
            variant="ghost"
            disabled={verification.isFetching}
            onClick={() => verification.refetch()}
          >
            <RefreshCw size={16} />
            <T value="Recheck" />
          </Button>
        )}
      </div>
    </GlassCard>
  );
}
