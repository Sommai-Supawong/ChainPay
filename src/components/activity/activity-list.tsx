"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
import { api } from "@/lib/client-api";
import { eth, shortAddress } from "@/lib/utils";
import {
  EmptyState,
  LoadingState,
  StatusBadge,
} from "@/components/ui/primitives";
import type { ContactModel, TransactionModel } from "@/types/models";
export function TransactionRow({ row }: { row: TransactionModel }) {
  return (
    <Link href={`/tx/${row.txHash}`} className="transaction-row">
      <span
        className={`transaction-icon ${row.direction === "received" ? "received" : ""}`}
      >
        {row.direction === "received" ? (
          <ArrowDownLeft size={19} />
        ) : (
          <ArrowUpRight size={19} />
        )}
      </span>
      <div className="transaction-description">
        <strong>{row.title || "Payment"}</strong>
        <span>
          {row.direction === "received" ? "From" : "To"}{" "}
          {shortAddress(
            row.direction === "received" ? row.fromAddress : row.toAddress,
          )}
        </span>
      </div>
      <div className="transaction-value">
        <strong>
          {row.direction === "received" ? "+" : "−"}
          {eth(row.amount)} ETH
        </strong>
        <StatusBadge status={row.status} />
      </div>
    </Link>
  );
}
export function ActivityList({ initial }: { initial?: TransactionModel[] }) {
  const [filter, setFilter] = useState("all"),
    [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: ["transactions"],
    queryFn: () => api<TransactionModel[]>("transactions"),
    initialData: initial,
  });
  const contacts = useQuery({
    queryKey: ["contacts"],
    queryFn: () => api<ContactModel[]>("contacts"),
  });
  const rows = query.data?.filter(
    (r) =>
      (filter === "all" || r.status === filter || r.direction === filter) &&
      `${r.txHash} ${r.fromAddress} ${r.toAddress} ${r.title} ${contacts.data
        ?.filter((c) => [r.fromAddress, r.toAddress].includes(c.walletAddress))
        .map((c) => c.name)
        .join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="card">
      <div className="activity-toolbar">
        <div className="filter-tabs" aria-label="Filter activity">
          {["all", "sent", "received", "pending", "confirmed", "failed"].map(
            (value) => (
              <button
                key={value}
                className={filter === value ? "selected" : ""}
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
              >
                {value}
              </button>
            ),
          )}
        </div>
        <label className="search-box">
          <Search size={17} />
          <input
            aria-label="Search transactions"
            placeholder="Search payments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      {query.isPending ? (
        <LoadingState text="Loading activity…" />
      ) : query.error ? (
        <p className="field-error" role="alert">
          {query.error.message}
        </p>
      ) : rows?.length ? (
        rows.map((row) => <TransactionRow key={row.id} row={row} />)
      ) : (
        <EmptyState
          title={
            search || filter !== "all"
              ? "No matching payments"
              : "Your story starts with a payment"
          }
          description="Your ChainPay payments will appear here, ready whenever you sign in."
          href="/pay"
          action="Send a payment"
        />
      )}
      <p className="small muted">
        Showing up to 500 recent payments. Network fees are excluded from
        totals.
      </p>
    </div>
  );
}
