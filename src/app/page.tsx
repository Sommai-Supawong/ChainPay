import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Wallet,
  Link2,
  Check,
  Globe2,
  ReceiptText,
} from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Brand />
        <nav aria-label="Marketing">
          <a href="#how-it-works">How it works</a>
          <a href="#built-for-trust">Built for trust</a>
        </nav>
        <Button asChild variant="secondary">
          <Link href="/login">
            Open ChainPay
            <ArrowUpRight size={16} />
          </Link>
        </Button>
      </header>
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-tag">
              <span className="network-dot" />A clearer way to pay on Ethereum
            </span>
            <h1>
              Less complexity.
              <br />
              <span>More connection.</span>
            </h1>
            <p>
              Send a payment. Share a request. Know where it stands.
              <br className="desktop-break" />
              Your everyday payments, with the clarity of blockchain.
            </p>
            <div className="button-row">
              <Button asChild>
                <Link href="/login">
                  Get started
                  <ArrowUpRight size={18} />
                </Link>
              </Button>
              <a href="#how-it-works" className="text-link">
                See how it works
                <ArrowRight size={17} />
              </a>
            </div>
            <div className="hero-proof">
              <ShieldCheck size={17} />
              Non-custodial
              <span />
              Sepolia testnet
              <span />
              No account needed to pay a link
            </div>
          </div>
          <div
            className="hero-visual"
            aria-label="ChainPay payment journey illustration"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-payment-card">
              <div className="payment-card-top">
                <span className="brand-mark">
                  <Link2 />
                </span>
                <span>PAYMENTS, CONNECTED</span>
                <span className="badge">ETH</span>
              </div>
              <div className="illustration-wallet">
                <span className="mini-label">YOUR WALLET</span>
                <Wallet size={28} />
                <strong>You’re in control.</strong>
                <p>Connect. Review. Pay.</p>
              </div>
              <div className="journey-line">
                <span>
                  <Check size={13} />
                </span>
                <i />
                <span>
                  <ArrowUpRight size={13} />
                </span>
                <i />
                <span>
                  <ShieldCheck size={13} />
                </span>
              </div>
              <div className="journey-labels">
                <span>Your wallet</span>
                <span>Payment</span>
                <span>Ethereum</span>
              </div>
              <div className="illustration-footer">
                <ShieldCheck size={16} />
                Every confirmation has a receipt.
              </div>
            </div>
            <div className="floating-note">
              <div className="feature-icon">
                <ReceiptText size={19} />
              </div>
              <div>
                <strong>A link. A QR. A simpler request.</strong>
                <p>Ready to share, easy to track.</p>
              </div>
            </div>
          </div>
        </section>
        <div className="value-strip">
          <span>
            <Wallet />
            Your keys stay yours
          </span>
          <span>
            <Globe2 />
            Built on Ethereum
          </span>
          <span>
            <ShieldCheck />
            Independently verified
          </span>
          <span>
            <ReceiptText />
            History that stays with you
          </span>
        </div>
        <section id="how-it-works" className="landing-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FROM WALLET TO WELL-ORGANIZED</p>
              <h2>
                Everything a payment needs.
                <br />
                Nothing that gets in the way.
              </h2>
            </div>
            <p className="muted">
              A thoughtful home for the moments
              <br />
              before, during, and after you pay.
            </p>
          </div>
          <div className="feature-grid">
            {[
              {
                n: "01",
                icon: Wallet,
                title: "Make it yours",
                copy: "Sign in with Google, connect MetaMask, and verify your wallet with a signature. Your account and your wallet, connected securely.",
              },
              {
                n: "02",
                icon: Link2,
                title: "Send it. Share it.",
                copy: "Pay a wallet or create a payment link with a QR code. Your recipient gets the details. Your payer doesn’t need an account.",
              },
              {
                n: "03",
                icon: ReceiptText,
                title: "Know where it stands",
                copy: "Follow a payment from submitted to confirmed. Find your history across devices and verify each receipt on Ethereum.",
              },
            ].map(({ n, icon: Icon, title, copy }) => (
              <article className="feature-card" key={n}>
                <div>
                  <span className="feature-icon">
                    <Icon size={24} />
                  </span>
                  <span className="step-number">{n}</span>
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="built-for-trust" className="trust-section">
          <div className="trust-symbol">
            <ShieldCheck size={72} strokeWidth={1} />
          </div>
          <div>
            <p className="eyebrow">TRUST YOU CAN CHECK</p>
            <h2>
              Your money moves on-chain.
              <br />
              Your private details don’t.
            </h2>
            <p>
              MetaMask signs your payments. Ethereum settles them. ChainPay
              verifies the result and keeps your payment details organized.
            </p>
            <p className="small muted">
              Currently available on Ethereum Sepolia with test ETH.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/login">
              Start with ChainPay
              <ArrowUpRight size={17} />
            </Link>
          </Button>
        </section>
      </main>
      <footer className="landing-footer">
        <Brand />
        <span>Pay with blockchain, without the complexity.</span>
        <span>Ethereum Sepolia · Testnet</span>
      </footer>
    </div>
  );
}
