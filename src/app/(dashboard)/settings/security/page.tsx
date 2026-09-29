import { T } from "@/i18n";
import Link from "next/link";
import { ShieldCheck, KeyRound, Wallet } from "lucide-react";
import { GlassCard, PageHeader } from "@/components/ui/primitives";
import { LogoutButton } from "@/components/auth/auth-buttons";
import { SettingsTabs } from "@/components/theme/settings-tabs";
export default function SecurityPage() {
  return (
    <>
      <PageHeader
        title="Account security"
        description="Clear boundaries. Control stays with you."
      />
      <SettingsTabs current="security" />
      <div className="stack form-width">
        <GlassCard>
          <ShieldCheck className="accent" />
          <h2>
            <T value="Google protects your sign-in" />
          </h2>
          <p className="muted">
            <T value="Your ChainPay session expires after five days. Enable two-step verification in your Google account for stronger sign-in protection." />
          </p>
          <a
            href="https://myaccount.google.com/security"
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            <T value="Manage Google security ↗" />
          </a>
        </GlassCard>
        <GlassCard>
          <Wallet className="accent" />
          <h2>
            <T value="Your keys never leave your wallet" />
          </h2>
          <p className="muted">
            <T value="ChainPay never stores private keys or seed phrases. Wallet signatures prove ownership, and MetaMask approves each payment." />
          </p>
          <Link href="/wallets" className="text-link">
            <T value="Manage verified wallets →" />
          </Link>
        </GlassCard>
        <GlassCard>
          <KeyRound className="accent" />
          <h2>
            <T value="This session" />
          </h2>
          <p className="muted">
            <T value="Sign out to remove the ChainPay session from this browser." />
          </p>
          <LogoutButton />
        </GlassCard>
      </div>
    </>
  );
}
