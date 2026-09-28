"use client";
import { T, useLocale, useTranslation } from "@/i18n";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/client-api";
import { eth } from "@/lib/utils";
import {
  GlassCard,
  StatusBadge,
  LoadingState,
  WalletAddress,
} from "@/components/ui/primitives";
import { RecoverPayment } from "@/components/payment/recover-payment";
import { PaymentForm } from "@/components/payment/payment-form";
type PublicRequest = {
  slug: string;
  title: string;
  description: string;
  amount: string;
  merchant: string | null;
  receiver: string;
  status: string;
  expiresAt: string | null;
};
export function PublicRequestView({ slug }: { slug: string }) {
  const t = useTranslation();
  const locale = useLocale();
  const query = useQuery({
    queryKey: ["public-request", slug],
    queryFn: () => api<PublicRequest>(`public/${slug}`),
    refetchInterval: 20_000,
  });
  if (query.isPending) return <LoadingState text="Opening payment request…" />;
  if (query.error || !query.data)
    return (
      <GlassCard>
        <h1>
          <T value="Request unavailable" />
        </h1>
        <p className="muted">
          {query.error?.message ??
            t("This payment request could not be found.")}
        </p>
      </GlassCard>
    );
  const r = query.data;
  return (
    <div className="stack">
      <GlassCard className="public-request-heading">
        <div className="card-heading">
          <span className="eyebrow">
            <T value="REQUESTED BY" /> {r.merchant ?? t("A CHAINPAY USER")}
          </span>
          <StatusBadge status={r.status} />
        </div>
        <h1>{r.title}</h1>
        <div className="review-amount">
          {eth(r.amount)}
          <span>
            <T value="ETH" />
          </span>
        </div>
        <p className="muted">{r.description}</p>
        <p className="small muted">
          <T value="To" />
          <WalletAddress address={r.receiver} full />
        </p>
        {r.expiresAt && (
          <p className="small muted">
            <T value="Expires" /> {new Date(r.expiresAt).toLocaleString(locale)}
          </p>
        )}
        <div className="security-note">
          <ShieldCheck size={17} />
          <p>
            <T value="Verified receiving wallet · Ethereum Sepolia" />
          </p>
        </div>
      </GlassCard>
      {r.status === "active" ? (
        <PaymentForm request={r} />
      ) : (
        <GlassCard>
          <h2>
            {t(
              r.status === "paid"
                ? "This request has been paid."
                : r.status === "pending"
                  ? "A payment is being verified."
                  : "This request is {status}.",
              { status: t(r.status) },
            )}
          </h2>
          <p className="muted">
            {t(
              r.status === "pending"
                ? "Please wait while the submitted payment is confirmed. Do not send another payment."
                : "Contact the requester if you need a new payment link.",
            )}
          </p>
          <RecoverPayment />
        </GlassCard>
      )}
    </div>
  );
}
