import Link from "next/link";
import { ShieldCheck, KeyRound, Wallet } from "lucide-react";
import { GlassCard, PageHeader } from "@/components/ui/primitives";
import { LogoutButton } from "@/components/auth/auth-buttons";
export default function SecurityPage() {
  return (
    <>
      <PageHeader
        title="Account security"
        description="Clear boundaries. Control stays with you."
      />
      <nav className="settings-tabs">
        <Link href="/settings/profile">Profile</Link>
        <Link aria-current="page" href="/settings/security">
          Security
        </Link>
      </nav>
      <div className="stack form-width">
        <GlassCard>
          <ShieldCheck className="accent" />
          <h2>Google protects your sign-in</h2>
          <p className="muted">
            Your ChainPay session expires after five days. Enable two-step
            verification in your Google account for stronger sign-in protection.
          </p>
          <a
            href="https://myaccount.google.com/security"
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            Manage Google security ↗
          </a>
        </GlassCard>
        <GlassCard>
          <Wallet className="accent" />
          <h2>Your keys never leave your wallet</h2>
          <p className="muted">
            ChainPay never stores private keys or seed phrases. Wallet
            signatures prove ownership, and MetaMask approves each payment.
          </p>
          <Link href="/wallets" className="text-link">
            Manage verified wallets →
          </Link>
        </GlassCard>
        <GlassCard>
          <KeyRound className="accent" />
          <h2>This session</h2>
          <p className="muted">
            Sign out to remove the ChainPay session from this browser.
          </p>
          <LogoutButton />
        </GlassCard>
      </div>
    </>
  );
}
