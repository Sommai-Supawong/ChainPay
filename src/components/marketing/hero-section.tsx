import {
  ArrowRight,
  ArrowUpRight,
  Fingerprint,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Reveal } from "@/components/motion/reveal";
import { TextEmerge } from "@/components/motion/text-emerge";
import { PredictiveArc } from "./predictive-arc";
import { SessionCta } from "./session-actions";

export function HeroSection() {
  return (
    <section className="cp-hero" aria-labelledby="hero-heading">
      <PredictiveArc />
      <div className="cp-hero-glow" aria-hidden="true" />
      <div className="cp-container cp-hero-content">
        <Reveal delay={0.08}>
          <span className="cp-pill">
            <span className="network-dot" /> A simpler connection to Ethereum{" "}
            <ArrowUpRight size={13} />
          </span>
        </Reveal>
        <div id="hero-heading">
          <TextEmerge
            as="h1"
            lines={["Pay with blockchain,", "without the complexity."]}
            delay={0.16}
          />
        </div>
        <Reveal delay={0.32}>
          <p className="cp-hero-description">
            Send, request, and track payments in one calm, connected place.
            <br className="cp-desktop-break" /> All the transparency of
            blockchain. A more familiar way to pay.
          </p>
        </Reveal>
        <Reveal delay={0.44} className="cp-hero-buttons">
          <SessionCta />
          <Button asChild variant="secondary">
            <a href="#product-preview">
              Explore ChainPay
              <ArrowRight size={17} />
            </a>
          </Button>
        </Reveal>
        <Reveal delay={0.52}>
          <p className="cp-hero-note">
            <ShieldCheck size={14} /> Non-custodial{" "}
            <span aria-hidden="true">·</span> Ethereum Sepolia Testnet
          </p>
        </Reveal>
        <Reveal delay={0.62} className="cp-connection-wrap">
          <div
            className="cp-connection"
            aria-label="Payment flow: your wallet, ChainPay, Ethereum"
          >
            <div>
              <span className="cp-node-icon">
                <Wallet size={23} />
              </span>
              <strong>Your wallet</strong>
              <small>You stay in control</small>
            </div>
            <span className="cp-connector" aria-hidden="true">
              <i />
              <ArrowRight size={14} />
            </span>
            <div>
              <span className="cp-node-icon cp-node-brand">
                <BrandLogo />
              </span>
              <strong>ChainPay</strong>
              <small>Clarity at every step</small>
            </div>
            <span className="cp-connector" aria-hidden="true">
              <i />
              <ArrowRight size={14} />
            </span>
            <div>
              <span className="cp-node-icon">
                <Fingerprint size={24} />
              </span>
              <strong>Ethereum</strong>
              <small>Settlement you can verify</small>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
