"use client";
import { T, useErrorTranslation, useTranslation } from "@/i18n";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, ArrowUpRight, Search } from "lucide-react";
import { api } from "@/lib/client-api";
import { fromWei } from "@/lib/utils";
import {
  EmptyState,
  GlassCard,
  LoadingState,
  StatusAlert,
  StatusBadge,
} from "@/components/ui/primitives";
import type { EscrowModel } from "@/types/models";

const ESCROW_STATUS_FILTERS = [
  "all",
  "created",
  "funded",
  "released",
  "disputed",
  "refunded",
] as const;

export function EscrowList() {
  const t = useTranslation();
  const errorText = useErrorTranslation();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const query = useQuery({
    queryKey: ["escrows"],
    queryFn: () => api<EscrowModel[]>("escrows"),
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

  const filtered = query.data.filter((e) => {
    const matchesFilter = filter === "all" || e.status === filter;
    const matchesSearch =
      !search ||
      `${e.title} ${e.description} ${e.freelancerAddress} ${e.clientAddress ?? ""} ${e.clientName ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div className="activity-toolbar">
        <div
          className="filter-tabs"
          aria-label={t("Filter contracts")}
        >
          {ESCROW_STATUS_FILTERS.map((value) => (
            <button
              key={value}
              className={filter === value ? "selected" : ""}
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
            >
              {t(value)}
            </button>
          ))}
        </div>
        <label className="search-box">
          <Search size={17} />
          <input
            aria-label={t("Search contracts")}
            placeholder={t("Search contracts…")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {filtered.length ? (
        <div className="request-grid">
          {filtered.map((e) => (
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
                {fromWei(e.totalAmount)}{" "}
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
      ) : (
        <GlassCard>
          <EmptyState
            title="No matching contracts"
            description="Try selecting a different status filter."
          />
        </GlassCard>
      )}
    </div>
  );
}
