import Link from "next/link";
import { ArrowLeft, ShieldCheck, Wallet, ScanLine } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { LoginButton } from "@/components/auth/auth-buttons";
export default function LoginPage() {
  return (
    <main id="main" className="login-page">
      <section className="login-story">
        <Brand />
        <div>
          <p className="eyebrow">A LITTLE SIMPLER. A LOT CLEARER.</p>
          <h1>
            Your payments.
            <br />
            All connected.
          </h1>
          <p>
            One place to send, request, and keep track.
            <br />
            With a wallet that stays yours.
          </p>
          <div className="login-features">
            <span>
              <ShieldCheck />
              Verified on Ethereum
            </span>
            <span>
              <Wallet />
              Always non-custodial
            </span>
            <span>
              <ScanLine />
              Ready to share
            </span>
          </div>
        </div>
        <small>Built for Ethereum Sepolia · Test ETH only</small>
      </section>
      <section className="login-form">
        <Link href="/" className="text-link">
          <ArrowLeft size={16} />
          Back to home
        </Link>
        <div className="login-form-inner">
          <span className="eyebrow">WELCOME TO CHAINPAY</span>
          <h2>Make yourself at home.</h2>
          <p className="muted">
            Sign in to keep your wallets, requests, and payment history
            together.
          </p>
          <LoginButton />
          <div className="divider-text">YOUR ACCOUNT ≠ YOUR WALLET</div>
          <p className="small muted">
            Google securely signs you into ChainPay. You’ll connect and verify
            MetaMask separately when you’re ready to make a payment.
          </p>
          <div className="security-note">
            <ShieldCheck size={18} />
            <p>We never ask for your seed phrase or private key.</p>
          </div>
        </div>
        <p className="small muted">
          Sepolia is a test network. Test ETH has no monetary value.
        </p>
      </section>
    </main>
  );
}
