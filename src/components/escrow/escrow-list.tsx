"use client";
import { T, useErrorTranslation, useLocale, useTranslation } from "@/i18n";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/client-api";
import { eth } from "@/lib/utils";
import { EmptyState, GlassCard, LoadingState, StatusAlert, StatusBadge } from "@/components/ui/primitives";

export function EscrowList() {
  const t = useTranslation();
  const errorText = useErrorTranslation();
  const query = useQuery({
    queryKey: ["escrows"],
    queryFn: () => api<any[]>("escrows"),
  });

  if (query.isPending) return <LoadingState text="Loading contracts…" />;
  if (query.error)
    return (
      <StatusAlert tone="error" title="Unable to load contracts">
        {errorText(query.error.message)}
      </StatusAlert>
    );

  if (!query.data?.length)
    return (
      <GlassCard>
        <EmptyState
          title="Create a secure payment agreement"
          description="Escrow contracts protect both the client and the freelancer. Funds are locked securely and released upon milestone completion."
          href="/contracts/new"
          action="Create a contract"
        />
      </GlassCard>
    );

  return (
    <div className="request-grid">
      {query.data.map((e) => (
        <Link
          href={`/contracts/${e.id}`}
          key={e.id}
          className="card request-card"
        >
          <div className="card-heading">
            <span className="feature-icon">
              <Briefcase size={21} />
            </span>
            <StatusBadge status={e.status} />
          </div>
          <h2>{e.title}</h2>
          <p className="request-amount">
            {eth(e.totalAmount)}{" "}
            <span>
              <T value="ETH" />
            </span>
          </p>
          <div className="card-actions">
            <span className="muted small">
              {e.freelancerAddress.slice(0, 8)}...
            </span>
            <ArrowUpRight size={18} />
          </div>
        </Link>
      ))}
    </div>
  );
}
