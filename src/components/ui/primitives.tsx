import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Ban,
  CheckCircle2,
  CircleX,
  Clock3,
  FilePenLine,
  Inbox,
  Info,
  LoaderCircle,
  ShieldCheck,
  TimerOff,
  TriangleAlert,
} from "lucide-react";
import { cn, shortAddress } from "@/lib/utils";
import { Button } from "./button";
import { T, useErrorTranslation } from "@/i18n";
import { Children, cloneElement, isValidElement } from "react";
export function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("card", className)}>{children}</section>;
}
export function PageHeader({
  eyebrow,
  title,
  titleValues,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  titleValues?: Record<string, string | number>;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && (
          <p className="eyebrow">
            <T value={eyebrow} />
          </p>
        )}
        <h1>
          <T value={title} values={titleValues} />
        </h1>
        {description && (
          <p className="muted">
            <T value={description} />
          </p>
        )}
      </div>
      {action}
    </header>
  );
}
const statusPresentation = {
  paid: { label: "Paid", icon: CheckCircle2, tone: "paid" },
  active: { label: "Active", icon: Activity, tone: "active" },
  pending: { label: "Pending", icon: Clock3, tone: "warning" },
  confirmed: { label: "Confirmed", icon: BadgeCheck, tone: "success" },
  failed: { label: "Failed", icon: CircleX, tone: "error" },
  cancelled: { label: "Cancelled", icon: Ban, tone: "muted" },
  expired: { label: "Expired", icon: TimerOff, tone: "muted" },
  verified: { label: "Verified", icon: ShieldCheck, tone: "success" },
  draft: { label: "Draft", icon: FilePenLine, tone: "muted" },
  primary: { label: "Primary", icon: ShieldCheck, tone: "info" },
} as const;

export function StatusBadge({ status }: { status: string }) {
  const presentation =
    statusPresentation[status as keyof typeof statusPresentation];
  const Icon = presentation?.icon ?? Info;
  return (
    <span
      data-status={status}
      data-tone={presentation?.tone ?? "muted"}
      className="badge status-badge"
    >
      <Icon size={13} strokeWidth={2} aria-hidden="true" />
      <T value={presentation?.label ?? status} />
    </span>
  );
}

const alertIcons = {
  success: CheckCircle2,
  warning: TriangleAlert,
  error: CircleX,
  info: Info,
} as const;

export function StatusAlert({
  tone,
  title,
  children,
}: {
  tone: keyof typeof alertIcons;
  title: string;
  children?: React.ReactNode;
}) {
  const Icon = alertIcons[tone];
  return (
    <div
      className="status-alert"
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon size={18} aria-hidden="true" />
      <div>
        <strong>
          <T value={title} />
        </strong>
        {children && <p>{children}</p>}
      </div>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Inbox size={25} />
      </div>
      <h3>
        <T value={title} />
      </h3>
      <p className="muted">
        <T value={description} />
      </p>
      {href && (
        <Button asChild variant="secondary">
          <Link href={href}>
            {action && <T value={action} />}
            <ArrowUpRight size={16} />
          </Link>
        </Button>
      )}
    </div>
  );
}
export function LoadingState({
  text = "Loading your account…",
}: {
  text?: string;
}) {
  return (
    <div className="loading-state" role="status">
      <LoaderCircle className="spin" size={22} />
      <T value={text} />
    </div>
  );
}
export function WalletAddress({
  address,
  full = false,
}: {
  address: string;
  full?: boolean;
}) {
  return (
    <span className="address" title={address}>
      {full ? address : shortAddress(address)}
    </span>
  );
}
export function PageSkeleton() {
  return (
    <div className="page-skeleton" role="status" aria-busy="true">
      <span className="sr-only">
        <T value="Loading your account…" />
      </span>
      <div aria-hidden="true">
        <div className="skeleton-block skeleton-title" />
        <div className="skeleton-block skeleton-description" />
        <div className="skeleton-block skeleton-panel" />
        <div className="skeleton-block skeleton-row" />
        <div className="skeleton-block skeleton-row" />
        <div className="skeleton-block skeleton-row" />
      </div>
    </div>
  );
}
export function Field({
  label,
  name,
  error,
  children,
  hint,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  const errorText = useErrorTranslation();
  return (
    <div className="field">
      <label htmlFor={name}>
        <T value={label} />
      </label>
      {Children.map(children, (child) => {
        if (
          !isValidElement<{
            id?: string;
            "aria-describedby"?: string;
            "aria-invalid"?: boolean;
          }>(child) ||
          child.props.id !== name
        )
          return child;
        return cloneElement(child, {
          "aria-invalid": Boolean(error),
          "aria-describedby":
            [
              child.props["aria-describedby"],
              hint && `${name}-hint`,
              error && `${name}-error`,
            ]
              .filter(Boolean)
              .join(" ") || undefined,
        });
      })}
      {hint && (
        <p className="field-hint" id={`${name}-hint`}>
          <T value={hint} />
        </p>
      )}
      {error && (
        <p className="field-error" role="alert" id={`${name}-error`}>
          {errorText(error)}
        </p>
      )}
    </div>
  );
}
