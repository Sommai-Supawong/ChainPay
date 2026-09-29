import { T } from "@/i18n";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Link2,
  LockKeyhole,
  ShieldCheck,
  ReceiptText,
} from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { LoginButton } from "@/components/auth/auth-buttons";
import { LanguageToggle } from "@/components/layout/language-toggle";

export default function LoginPage() {
  return (
    <main id="main" className="product-ui auth-page">
      <header className="auth-header">
        <Brand />
        <div className="auth-header-actions">
          <Link href="/" className="text-link">
            <ArrowLeft size={16} />
            <T value="Back to home" />
          </Link>
          <LanguageToggle />
        </div>
      </header>
      <div className="auth-layout">
        <section className="auth-intro">
          <p className="eyebrow">
            <T value="PAYMENTS, MADE CLEAR" />
          </p>
          <h1>
            <T value="Your payments." />
            <br />
            <span>
              <T value="All connected." />
            </span>
          </h1>
          <p className="auth-description">
            <T value="One place to send, request, and keep track." />{" "}
            <T value="With a wallet that stays yours." />
          </p>
          <ul className="auth-benefits">
            {[
              {
                icon: ArrowUpRight,
                title: "Send with confidence",
                description: "Review every payment before you approve it.",
              },
              {
                icon: Link2,
                title: "Request with a link",
                description:
                  "Share a payment request, then follow its progress.",
              },
              {
                icon: ReceiptText,
                title: "Keep a clear record",
                description:
                  "Your payments and receipts, together in one place.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <li key={title}>
                <span className="auth-benefit-icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2>
                    <T value={title} />
                  </h2>
                  <p>
                    <T value={description} />
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="auth-card" aria-labelledby="sign-in-title">
          <span className="auth-lock">
            <LockKeyhole size={24} aria-hidden="true" />
          </span>
          <p className="eyebrow">
            <T value="WELCOME TO CHAINPAY" />
          </p>
          <h2 id="sign-in-title">
            <T value="Your account starts here." />
          </h2>
          <p className="muted">
            <T value="Sign in to keep your wallets, requests, and payment history together." />
          </p>
          <LoginButton />
          <div className="auth-separator" />
          <div className="auth-reassurance">
            <ShieldCheck size={20} aria-hidden="true" />
            <div>
              <h3>
                <T value="Your wallet stays yours" />
              </h3>
              <p>
                <T value="Google securely signs you into ChainPay. You’ll connect and verify MetaMask separately when you’re ready to make a payment." />
              </p>
            </div>
          </div>
          <p className="auth-private-note">
            <T value="We never ask for your seed phrase or private key." />
          </p>
        </section>
      </div>
      <footer className="auth-footer">
        <span>
          <ShieldCheck size={15} aria-hidden="true" />
          <T value="Non-custodial by design" />
        </span>
        <p>
          <T value="Sepolia is a test network. Test ETH has no monetary value." />
        </p>
      </footer>
    </main>
  );
}
