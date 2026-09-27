import Link from "next/link";
import { ArrowUpRight, Inbox, LoaderCircle } from "lucide-react";
import { cn, shortAddress } from "@/lib/utils";
import { Button } from "./button";
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
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {action}
    </header>
  );
}
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "badge",
        ["confirmed", "paid", "verified", "active"].includes(status)
          ? "badge-success"
          : ["pending", "draft"].includes(status)
            ? "badge-warning"
            : "badge-muted",
      )}
    >
      {status}
    </span>
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
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {href && (
        <Button asChild variant="secondary">
          <Link href={href}>
            {action}
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
      {text}
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
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
