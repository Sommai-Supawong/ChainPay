import {
  ShieldCheck,
  Fingerprint,
  KeyRound,
  Database,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TextEmerge } from "@/components/motion/text-emerge";

export function TrustSection() {
  return (
    <section
      id="built-for-trust"
      className="cp-section cp-container"
      aria-labelledby="trust-heading"
    >
      <div className="cp-trust-panel">
        <Reveal className="cp-trust-copy">
          <span className="cp-feature-icon">
            <ShieldCheck size={26} />
          </span>
          <p className="eyebrow">TRUST YOU CAN CHECK</p>
          <div id="trust-heading">
            <TextEmerge lines={["A confirmation should", "mean something."]} />
          </div>
          <p className="cp-section-intro">
            Your wallet signs. Ethereum settles. ChainPay checks the transaction
            against the chain before marking it confirmed.
          </p>
          <a href="#verification-details" className="text-link">
            See what gets verified <ArrowUpRight size={16} />
          </a>
          <span className="cp-pill cp-testnet-pill">
            <span className="network-dot" /> Ethereum Sepolia Testnet
          </span>
        </Reveal>
        <Reveal delay={0.12} className="cp-trust-details">
          <div id="verification-details" className="cp-verification">
            <div>
              <ShieldCheck size={19} />
              <strong>Behind every confirmation</strong>
            </div>
            <p>Server-side checks, not just a browser success message.</p>
            <ul>
              {[
                "Expected sender, recipient & amount",
                "Correct network & payment contract",
                "Matching payment event",
                "Successful receipt & two confirmations",
              ].map((item) => (
                <li key={item}>
                  <Check size={15} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="cp-trust-principles">
            {[
              {
                icon: Fingerprint,
                title: "Ownership, verified",
                text: "A single-use signed wallet challenge.",
              },
              {
                icon: KeyRound,
                title: "Always non-custodial",
                text: "Private keys remain in your wallet.",
              },
              {
                icon: Database,
                title: "History that stays",
                text: "Account records stored in PostgreSQL.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon size={19} />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
      <p className="cp-trust-disclaimer">
        Built for exploring payments with test ETH. ChainPay is not an audited
        mainnet payment service.
      </p>
    </section>
  );
}
