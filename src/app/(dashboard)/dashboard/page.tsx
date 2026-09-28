import { T } from "@/i18n";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Wallet,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { formatEther } from "viem";
import { pageUser } from "@/lib/auth/session";
import { listWallets } from "@/features/wallet/server";
import { listRequests } from "@/features/payment-request/server";
import { listTransactions, totalAmount } from "@/features/payment/server";
import {
  PageHeader,
  GlassCard,
  EmptyState,
  WalletAddress,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { WalletBalance } from "@/components/wallet/wallet-manager";
import { TransactionRow } from "@/components/activity/activity-list";
import { ScanLink } from "@/components/payment/scan-link";
import { CopyButton } from "@/components/ui/copy-button";
export default async function DashboardPage() {
  const user = await pageUser();
  const [wallets, requests, transactions] = await Promise.all([
    listWallets(user.id),
    listRequests(user.id),
    listTransactions(user.id),
  ]);
  const primary = wallets.find((w) => w.isPrimary),
    confirmed = transactions.filter((t) => t.status === "confirmed");
  const sent = formatEther(
      totalAmount(confirmed.filter((t) => t.direction === "sent")),
    ),
    received = formatEther(
      totalAmount(confirmed.filter((t) => t.direction === "received")),
    );
  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow="YOUR MONEY, WITH MORE CLARITY"
        title={user.displayName ? "Welcome, {name}." : "Welcome."}
        titleValues={{ name: user.displayName?.split(" ")[0] ?? "" }}
        description="Here’s where everything comes together."
        action={
          <Button asChild>
            <Link href="/pay">
              <ArrowUpRight size={17} />
              <T value="Send payment" />
            </Link>
          </Button>
        }
      />
      <div className="dashboard-top">
        <GlassCard className="balance-card">
          <div className="card-heading">
            <span className="mini-label">
              <T value="YOUR PRIMARY WALLET" />
            </span>
            <Wallet size={21} />
          </div>
          {primary ? (
            <>
              <div className="balance-value">
                <WalletBalance address={primary.address as `0x${string}`} />
              </div>
              <div className="button-row">
                <WalletAddress address={primary.address} />
                <CopyButton value={primary.address} label="" />
                <span className="badge badge-success">
                  <T value="Verified" />
                </span>
              </div>
            </>
          ) : (
            <>
              <h2>
                <T value="A home for your wallet." />
              </h2>
              <p className="muted">
                <T value="Connect and verify MetaMask to see your balance and start paying." />
              </p>
              <Button asChild variant="secondary">
                <Link href="/wallets">
                  <T value="Connect a wallet" />
                  <ArrowUpRight size={16} />
                </Link>
              </Button>
            </>
          )}
          <div className="balance-bottom">
            <span className="network-dot" />
            <T value="Ethereum Sepolia" />
            <span>
              <T value="Test ETH only" />
            </span>
          </div>
        </GlassCard>
        <GlassCard className="quick-actions">
          <p className="eyebrow">
            <T value="MAKE YOUR NEXT MOVE" />
          </p>
          <h2>
            <T value="What’s on your mind?" />
          </h2>
          <div className="quick-action-grid">
            <Button asChild variant="secondary">
              <Link href="/pay">
                <ArrowUpRight size={19} />
                <T value="Send" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/request/new">
                <Plus size={19} />
                <T value="Request" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/requests">
                <ArrowDownLeft size={19} />
                <T value="Receive" />
              </Link>
            </Button>
            <ScanLink />
          </div>
          <p className="small muted">
            <T value="Payments and requests, just a tap away." />
          </p>
        </GlassCard>
      </div>
      <div className="stats-grid">
        <GlassCard>
          <div className="stat-label">
            <ArrowUpRight size={17} />
            <T value="Sent" />
          </div>
          <strong className="stat-value">
            {sent}
            <span>
              <T value="ETH" />
            </span>
          </strong>
          <p className="small muted">
            <T value="Confirmed payments · excluding fees" />
          </p>
        </GlassCard>
        <GlassCard>
          <div className="stat-label">
            <ArrowDownLeft size={17} />
            <T value="Received" />
          </div>
          <strong className="stat-value">
            {received}
            <span>
              <T value="ETH" />
            </span>
          </strong>
          <p className="small muted">
            <T value="Confirmed incoming payments" />
          </p>
        </GlassCard>
        <GlassCard>
          <div className="stat-label">
            <ReceiptText size={17} />
            <T value="Open requests" />
          </div>
          <strong className="stat-value">
            {
              requests.filter((r) => ["active", "pending"].includes(r.status))
                .length
            }
          </strong>
          <p className="small muted">
            <T value="Waiting for payment or confirmation" />
          </p>
        </GlassCard>
      </div>
      <GlassCard>
        <div className="card-heading">
          <div>
            <h2>
              <T value="Recent activity" />
            </h2>
            <p className="muted small">
              <T value="Every payment has a story." />
            </p>
          </div>
          <Link href="/activity" className="text-link">
            <T value="View all" />
            <ArrowUpRight size={16} />
          </Link>
        </div>
        {transactions.length ? (
          transactions.slice(0, 5).map((t) => (
            <TransactionRow
              key={t.id}
              row={{
                id: t.id,
                txHash: t.txHash,
                fromAddress: t.fromAddress,
                toAddress: t.toAddress,
                amount: t.amount,
                status: t.status,
                title: t.title,
                direction: t.direction,
                submittedAt: t.submittedAt.toISOString(),
              }}
            />
          ))
        ) : (
          <EmptyState
            title="A fresh start"
            description="Your payments will appear here after your first transaction."
            href="/pay"
            action="Make your first payment"
          />
        )}
      </GlassCard>
      <div className="dashboard-note">
        <ShieldCheck size={18} />
        <p>
          <T value="Only Ethereum-verified payments are marked confirmed. Overview totals cover your latest 500 payments." />
        </p>
      </div>
    </div>
  );
}
