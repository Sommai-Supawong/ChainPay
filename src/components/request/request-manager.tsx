"use client";
import { T, useErrorTranslation, useLocale, useTranslation } from "@/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QRCodeSVG } from "qrcode.react";
import { ArrowUpRight, CalendarClock, Link2 } from "lucide-react";
import { toast } from "sonner";
import { api, friendlyError } from "@/lib/client-api";
import { requestSchema, type RequestInput } from "@/lib/validation";
import { eth } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  Field,
  GlassCard,
  LoadingState,
  StatusAlert,
  StatusBadge,
} from "@/components/ui/primitives";
import { CopyButton } from "@/components/ui/copy-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { RequestModel, WalletModel } from "@/types/models";

export function RequestList() {
  const t = useTranslation();
  const errorText = useErrorTranslation();
  const locale = useLocale();
  const query = useQuery({
    queryKey: ["requests"],
    queryFn: () => api<RequestModel[]>("payment-requests"),
  });
  if (query.isPending) return <LoadingState text="Loading payment requests…" />;
  if (query.error)
    return (
      <StatusAlert tone="error" title="Unable to load requests">
        {errorText(query.error.message)}
      </StatusAlert>
    );
  if (!query.data?.length)
    return (
      <GlassCard>
        <EmptyState
          title="Good things start with a request"
          description="Create a payment link, share it with anyone, and follow the payment here."
          href="/request/new"
          action="Create a request"
        />
      </GlassCard>
    );
  return (
    <div className="request-grid">
      {query.data.map((r) => (
        <Link
          href={`/request/${r.id}`}
          key={r.id}
          className="card request-card"
        >
          <div className="card-heading">
            <span className="feature-icon">
              <Link2 size={21} />
            </span>
            <StatusBadge status={r.status} />
          </div>
          <h2>{r.title}</h2>
          <p className="request-amount">
            {eth(r.amount)}{" "}
            <span>
              <T value="ETH" />
            </span>
          </p>
          <p className="muted small truncate">
            {r.description || t("Payment request")}
          </p>
          <div className="card-actions">
            <span className="muted small">
              <CalendarClock size={14} />
              {r.expiresAt
                ? `${t("Expires")} ${new Date(r.expiresAt).toLocaleDateString(locale)}`
                : t("No expiration")}
            </span>
            <ArrowUpRight size={18} />
          </div>
        </Link>
      ))}
    </div>
  );
}
export function RequestForm() {
  const t = useTranslation();
  const errorText = useErrorTranslation();
  const router = useRouter();
  const wallets = useQuery({
    queryKey: ["wallets"],
    queryFn: () => api<WalletModel[]>("wallets"),
  });
  const form = useForm<RequestInput>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: "",
      receiverWalletId: "",
      expiresIn: "week",
      status: "active",
    },
  });
  async function submit(input: RequestInput) {
    try {
      const row = await api<RequestModel>("payment-requests", {
        method: "POST",
        body: input,
      });
      toast.success(t("Payment request created"));
      router.push(`/request/${row.id}`);
    } catch (error) {
      toast.error(errorText(friendlyError(error)));
    }
  }
  if (wallets.isPending)
    return <LoadingState text="Loading verified wallets…" />;
  if (wallets.error)
    return (
      <StatusAlert tone="error" title="Unable to load wallets">
        {errorText(wallets.error.message)}
      </StatusAlert>
    );
  if (!wallets.data?.length)
    return (
      <GlassCard>
        <EmptyState
          title="First, add a verified wallet"
          description="Your payment request needs a wallet that belongs to you."
          href="/wallets"
          action="Connect a wallet"
        />
      </GlassCard>
    );
  return (
    <GlassCard>
      <form className="stack" onSubmit={form.handleSubmit(submit)}>
        <Field
          name="title"
          label="What’s the payment for?"
          error={form.formState.errors.title?.message}
        >
          <input
            id="title"
            placeholder={t("e.g. Website design")}
            {...form.register("title")}
          />
        </Field>
        <Field
          name="description"
          label="Description (optional)"
          error={form.formState.errors.description?.message}
          hint="The title and description are visible to anyone with the link."
        >
          <textarea
            id="description"
            placeholder={t("Give your payer a little context")}
            {...form.register("description")}
          />
        </Field>
        <Field
          name="amount"
          label="Amount · ETH"
          error={form.formState.errors.amount?.message}
        >
          <input
            id="amount"
            className="amount-input"
            inputMode="decimal"
            placeholder="0.00"
            {...form.register("amount")}
          />
        </Field>
        <Field
          name="receiverWalletId"
          label="Receive into"
          error={form.formState.errors.receiverWalletId?.message}
        >
          <select
            id="receiverWalletId"
            className="technical-text"
            {...form.register("receiverWalletId")}
          >
            <option value="">
              <T value="Choose a verified wallet" />
            </option>
            {wallets.data.map((w) => (
              <option key={w.id} value={w.id}>
                {w.isPrimary ? t("Primary · ") : ""}
                {w.address}
              </option>
            ))}
          </select>
        </Field>
        <div className="form-grid">
          <Field name="expiresIn" label="Expires after">
            <select id="expiresIn" {...form.register("expiresIn")}>
              <option value="hour">
                <T value="1 hour" />
              </option>
              <option value="day">
                <T value="24 hours" />
              </option>
              <option value="week">
                <T value="7 days" />
              </option>
              <option value="never">
                <T value="No expiration" />
              </option>
            </select>
          </Field>
          <Field name="status" label="Availability">
            <select id="status" {...form.register("status")}>
              <option value="active">
                <T value="Ready to pay" />
              </option>
              <option value="draft">
                <T value="Save as draft" />
              </option>
            </select>
          </Field>
        </div>
        <Button disabled={form.formState.isSubmitting}>
          {t(
            form.formState.isSubmitting
              ? "Creating request…"
              : "Create payment request",
          )}
          <ArrowUpRight size={17} />
        </Button>
      </form>
    </GlassCard>
  );
}
export function RequestDetail({ id }: { id: string }) {
  const t = useTranslation();
  const errorText = useErrorTranslation();
  const locale = useLocale();
  const cache = useQueryClient();
  const query = useQuery({
    queryKey: ["request", id],
    queryFn: () => api<RequestModel>(`payment-requests/${id}`),
    refetchInterval: 20_000,
  });
  async function change(status: "active" | "cancelled") {
    try {
      await api(`payment-requests/${id}`, {
        method: "PATCH",
        body: { status },
      });
      await cache.invalidateQueries({ queryKey: ["request", id] });
      await cache.invalidateQueries({ queryKey: ["requests"] });
      toast.success(t("Request updated"));
    } catch (error) {
      toast.error(errorText(friendlyError(error)));
    }
  }
  if (query.isPending) return <LoadingState text="Loading request…" />;
  if (query.error || !query.data)
    return (
      <StatusAlert tone="error" title="Unable to load request">
        {query.error ? errorText(query.error.message) : t("Request not found.")}
      </StatusAlert>
    );
  const r = query.data;
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/p/${r.slug}`;
  return (
    <GlassCard className="request-detail">
      <div className="card-heading">
        <p className="eyebrow">
          <T value="PAYMENT REQUEST" />
        </p>
        <StatusBadge status={r.status} />
      </div>
      <h2>{r.title}</h2>
      <div className="review-amount">
        {eth(r.amount)}
        <span>
          <T value="ETH" />
        </span>
      </div>
      <p className="muted">{r.description}</p>
      {r.status !== "draft" && (
        <>
          <div className="qr-wrap">
            <QRCodeSVG
              value={url}
              size={200}
              marginSize={3}
              level="M"
              title={t("Scan to open the payment request")}
            />
          </div>
          <p className="small muted">
            <T value="Scan to view this request. No ChainPay account needed." />
          </p>
          <div className="share-link">
            <input
              className="technical-text"
              aria-label={t("Public payment URL")}
              value={url}
              readOnly
            />
            <CopyButton value={url} label="Link" />
          </div>
          <Button asChild variant="secondary">
            <Link href={`/p/${r.slug}`}>
              <T value="Open public page" />
              <ArrowUpRight size={17} />
            </Link>
          </Button>
        </>
      )}
      <dl className="detail-list">
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
            <T value="Expiration" />
          </dt>
          <dd>
            {r.expiresAt
              ? new Date(r.expiresAt).toLocaleString(locale)
              : t("No expiration")}
          </dd>
        </div>
      </dl>
      <div className="button-row">
        {r.status === "draft" && (
          <Button onClick={() => change("active")}>
            <T value="Publish request" />
          </Button>
        )}
        {["draft", "active", "expired"].includes(r.status) && (
          <ConfirmDialog
            title="Cancel this payment request?"
            description="The shared link will no longer offer payment. A transaction already signed in a wallet cannot be recalled."
            trigger={
              <Button variant="ghost">
                <T value="Cancel request" />
              </Button>
            }
            onConfirm={() => change("cancelled")}
          />
        )}
      </div>
      {r.status === "pending" && (
        <p className="muted small">
          <T value="Payment submitted. Open its receipt from Activity to verify confirmation." />
        </p>
      )}
    </GlassCard>
  );
}
