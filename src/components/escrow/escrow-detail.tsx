"use client";
import { T, useErrorTranslation, useLocale, useTranslation } from "@/i18n";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, friendlyError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { GlassCard, LoadingState, StatusAlert, StatusBadge } from "@/components/ui/primitives";
import { eth } from "@/lib/utils";

export function EscrowDetail({ id }: { id: string }) {
  const t = useTranslation();
  const errorText = useErrorTranslation();
  const cache = useQueryClient();
  const locale = useLocale();

  const query = useQuery({
    queryKey: ["escrow", id],
    queryFn: () => api<any>(`escrows/${id}`),
    refetchInterval: 10_000,
  });

  async function submitMilestone(milestoneId: string) {
    try {
      await api(`escrows/${id}/milestones/${milestoneId}/submit`, { method: "POST" });
      await cache.invalidateQueries({ queryKey: ["escrow", id] });
      toast.success(t("Milestone submitted for review"));
    } catch (error) {
      toast.error(errorText(friendlyError(error)));
    }
  }

  async function markDisputed() {
    try {
      await api(`escrows/${id}/dispute`, { method: "POST" });
      await cache.invalidateQueries({ queryKey: ["escrow", id] });
      toast.success(t("Escrow marked as disputed"));
    } catch (error) {
      toast.error(errorText(friendlyError(error)));
    }
  }

  if (query.isPending) return <LoadingState text="Loading contract…" />;
  if (query.error || !query.data)
    return (
      <StatusAlert tone="error" title="Unable to load contract">
        {query.error ? errorText(query.error.message) : t("Contract not found.")}
      </StatusAlert>
    );

  const e = query.data;

  return (
    <div className="stack">
      <GlassCard className="request-detail">
        <div className="card-heading">
          <p className="eyebrow">
            <T value="ESCROW CONTRACT" />
          </p>
          <StatusBadge status={e.status} />
        </div>
        <h2>{e.title}</h2>
        <div className="review-amount">
          {eth(e.totalAmount)}
          <span>
            <T value="ETH" />
          </span>
        </div>
        <p className="muted">{e.description}</p>
        
        <dl className="detail-list" style={{ marginTop: "2rem" }}>
          <div>
            <dt>Freelancer</dt>
            <dd className="technical-text">{e.freelancerAddress}</dd>
          </div>
          <div>
            <dt>Contract Status</dt>
            <dd>{e.status}</dd>
          </div>
        </dl>
        
        {e.status !== "disputed" && e.status !== "refunded" && e.status !== "released" && (
          <div className="button-row" style={{ marginTop: "2rem" }}>
            <Button variant="secondary" onClick={markDisputed}>
              Open Dispute
            </Button>
          </div>
        )}
      </GlassCard>

      <h3>Milestone Timeline</h3>
      <div className="stack">
        {e.milestones.map((m: any, index: number) => (
          <GlassCard key={m.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4>{m.title}</h4>
              <StatusBadge status={m.status} />
            </div>
            <p className="muted" style={{ margin: "0.5rem 0" }}>{m.description}</p>
            <div style={{ fontWeight: 600, margin: "1rem 0" }}>
              {eth(m.amount)} ETH
            </div>
            
            <div className="button-row">
              {m.status === "pending" && (
                <Button onClick={() => submitMilestone(m.id)}>
                  Submit Work
                </Button>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
