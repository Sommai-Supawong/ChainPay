"use client";
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
  StatusBadge,
} from "@/components/ui/primitives";
import { CopyButton } from "@/components/ui/copy-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { RequestModel, WalletModel } from "@/types/models";

export function RequestList() {
  const query = useQuery({
    queryKey: ["requests"],
    queryFn: () => api<RequestModel[]>("payment-requests"),
  });
  if (query.isPending) return <LoadingState text="Loading payment requests…" />;
  if (query.error)
    return (
      <p role="alert" className="error-banner">
        {query.error.message}
      </p>
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
            {eth(r.amount)} <span>ETH</span>
          </p>
          <p className="muted small truncate">
            {r.description || "Payment request"}
          </p>
          <div className="card-actions">
            <span className="muted small">
              <CalendarClock size={14} />
              {r.expiresAt
                ? `Expires ${new Date(r.expiresAt).toLocaleDateString()}`
                : "No expiration"}
            </span>
            <ArrowUpRight size={18} />
          </div>
        </Link>
      ))}
    </div>
  );
}
export function RequestForm() {
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
      toast.success("Payment request created");
      router.push(`/request/${row.id}`);
    } catch (error) {
      toast.error(friendlyError(error));
    }
  }
  if (wallets.isPending)
    return <LoadingState text="Loading verified wallets…" />;
  if (wallets.error)
    return (
      <p className="error-banner" role="alert">
        {wallets.error.message}
      </p>
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
            placeholder="e.g. Website design"
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
            placeholder="Give your payer a little context"
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
          <select id="receiverWalletId" {...form.register("receiverWalletId")}>
            <option value="">Choose a verified wallet</option>
            {wallets.data.map((w) => (
              <option key={w.id} value={w.id}>
                {w.isPrimary ? "Primary · " : ""}
                {w.address}
              </option>
            ))}
          </select>
        </Field>
        <div className="form-grid">
          <Field name="expiresIn" label="Expires after">
            <select id="expiresIn" {...form.register("expiresIn")}>
              <option value="hour">1 hour</option>
              <option value="day">24 hours</option>
              <option value="week">7 days</option>
              <option value="never">No expiration</option>
            </select>
          </Field>
          <Field name="status" label="Availability">
            <select id="status" {...form.register("status")}>
              <option value="active">Ready to pay</option>
              <option value="draft">Save as draft</option>
            </select>
          </Field>
        </div>
        <Button disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Creating request…"
            : "Create payment request"}
          <ArrowUpRight size={17} />
        </Button>
      </form>
    </GlassCard>
  );
}
export function RequestDetail({ id }: { id: string }) {
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
      toast.success("Request updated");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  }
  if (query.isPending) return <LoadingState text="Loading request…" />;
  if (query.error || !query.data)
    return (
      <p role="alert" className="error-banner">
        {query.error?.message ?? "Request not found."}
      </p>
    );
  const r = query.data;
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/p/${r.slug}`;
  return (
    <GlassCard className="request-detail">
      <div className="card-heading">
        <p className="eyebrow">PAYMENT REQUEST</p>
        <StatusBadge status={r.status} />
      </div>
      <h2>{r.title}</h2>
      <div className="review-amount">
        {eth(r.amount)}
        <span>ETH</span>
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
              title="Scan to open the payment request"
            />
          </div>
          <p className="small muted">
            Scan to view this request. No ChainPay account needed.
          </p>
          <div className="share-link">
            <input aria-label="Public payment URL" value={url} readOnly />
            <CopyButton value={url} label="Link" />
          </div>
          <Button asChild variant="secondary">
            <Link href={`/p/${r.slug}`}>
              Open public page
              <ArrowUpRight size={17} />
            </Link>
          </Button>
        </>
      )}
      <dl className="detail-list">
        <div>
          <dt>Network</dt>
          <dd>Ethereum Sepolia</dd>
        </div>
        <div>
          <dt>Expiration</dt>
          <dd>
            {r.expiresAt
              ? new Date(r.expiresAt).toLocaleString()
              : "No expiration"}
          </dd>
        </div>
      </dl>
      <div className="button-row">
        {r.status === "draft" && (
          <Button onClick={() => change("active")}>Publish request</Button>
        )}
        {["draft", "active", "expired"].includes(r.status) && (
          <ConfirmDialog
            title="Cancel this payment request?"
            description="The shared link will no longer offer payment. A transaction already signed in a wallet cannot be recalled."
            trigger={<Button variant="ghost">Cancel request</Button>}
            onConfirm={() => change("cancelled")}
          />
        )}
      </div>
      {r.status === "pending" && (
        <p className="muted small">
          Payment submitted. Open its receipt from Activity to verify
          confirmation.
        </p>
      )}
    </GlassCard>
  );
}
