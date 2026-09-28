import { T } from "@/i18n";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Wallet, ScanLine } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { LoginButton } from "@/components/auth/auth-buttons";
import { LanguageToggle } from "@/components/layout/language-toggle";
export default function LoginPage() {
  return (
    <main id="main" className="login-page">
      <section className="login-story">
        <Brand />
        <div>
          <p className="eyebrow">
            <T value="A LITTLE SIMPLER. A LOT CLEARER." />
          </p>
          <h1>
            <T value="Your payments." />
            <br />
            <T value="All connected." />
          </h1>
          <p>
            <T value="One place to send, request, and keep track." />
            <br />
            <T value="With a wallet that stays yours." />
          </p>
          <div className="login-features">
            <span>
              <ShieldCheck />
              <T value="Verified on Ethereum" />
            </span>
            <span>
              <Wallet />
              <T value="Always non-custodial" />
            </span>
            <span>
              <ScanLine />
              <T value="Ready to share" />
            </span>
          </div>
        </div>
        <small>
          <T value="Built for Ethereum Sepolia · Test ETH only" />
        </small>
      </section>
      <section className="login-form">
        <div className="login-language">
          <LanguageToggle />
        </div>
        <Link href="/" className="text-link">
          <ArrowLeft size={16} />
          <T value="Back to home" />
        </Link>
        <div className="login-form-inner">
          <span className="eyebrow">
            <T value="WELCOME TO CHAINPAY" />
          </span>
          <h2>
            <T value="Make yourself at home." />
          </h2>
          <p className="muted">
            <T value="Sign in to keep your wallets, requests, and payment history together." />
          </p>
          <LoginButton />
          <div className="divider-text">
            <T value="YOUR ACCOUNT ≠ YOUR WALLET" />
          </div>
          <p className="small muted">
            <T value="Google securely signs you into ChainPay. You’ll connect and verify MetaMask separately when you’re ready to make a payment." />
          </p>
          <div className="security-note">
            <ShieldCheck size={18} />
            <p>
              <T value="We never ask for your seed phrase or private key." />
            </p>
          </div>
        </div>
        <p className="small muted">
          <T value="Sepolia is a test network. Test ETH has no monetary value." />
        </p>
      </section>
    </main>
  );
}
