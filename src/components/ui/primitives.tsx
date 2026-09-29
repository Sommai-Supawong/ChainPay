import Link from "next/link";
import { ArrowUpRight, Inbox, LoaderCircle } from "lucide-react";
import { cn, shortAddress } from "@/lib/utils";
import { Button } from "./button";
import { T } from "@/i18n";
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
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      data-status={status}
      className={cn(
        "badge",
        ["confirmed", "paid", "verified", "active"].includes(status)
          ? "badge-success"
          : ["pending", "draft"].includes(status)
            ? "badge-warning"
            : "badge-muted",
      )}
    >
      <T value={status} />
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
          <T value={error} />
        </p>
      )}
    </div>
  );
}
