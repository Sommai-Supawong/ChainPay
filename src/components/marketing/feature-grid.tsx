import { T } from "@/i18n";
import {
  ArrowUpRight,
  Link2,
  ScanLine,
  Fingerprint,
  History,
  ArrowRight,
  Check,
  Wallet,
  ReceiptText,
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TextEmerge } from "@/components/motion/text-emerge";

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="cp-section cp-container"
      aria-labelledby="features-heading"
    >
      <div className="cp-section-heading">
        <div id="features-heading">
          <p className="eyebrow">
            <T value="THE PAYMENT, NOT THE COMPLEXITY" />
          </p>
          <TextEmerge
            lines={["Blockchain underneath.", "Simplicity on top."]}
          />
        </div>
        <Reveal>
          <p className="cp-section-intro">
            <T value="Who it’s for. How much. Where it stands." />
            <br />
            <T value="The details you need, right where you expect them." />
          </p>
        </Reveal>
      </div>
      <div className="cp-feature-grid">
        <Reveal className="cp-feature-wide">
          <article className="cp-feature-card cp-send-feature">
            <span className="cp-feature-icon">
              <ArrowUpRight />
            </span>
            <h3>
              <T value="A clearer way to send." />
            </h3>
            <p>
              <T value="Choose a recipient, add a note, and review the amount and estimated fee before approving in MetaMask." />
            </p>
            <div className="cp-send-visual" aria-labelledby="send-steps-label">
              <p id="send-steps-label" className="sr-only">
                <T value="Send payment steps" />
              </p>
              <span>
                <Wallet size={18} /> <T value="Choose a recipient" />
              </span>
              <ArrowRight size={16} />
              <span>
                <Check size={18} /> <T value="Review & pay" />
              </span>
            </div>
            <span className="cp-feature-caption">
              <T value="YOUR PAYMENT. YOUR APPROVAL." />
            </span>
          </article>
        </Reveal>
        <Reveal className="cp-feature-medium" delay={0.08}>
          <article className="cp-feature-card cp-request-feature">
            <span className="cp-feature-icon">
              <Link2 />
            </span>
            <h3>
              <T value="One link. Less back-and-forth." />
            </h3>
            <p>
              <T value="Create a payment request with an amount and description. Share a public link your payer can use without a ChainPay account." />
            </p>
            <div className="cp-link-visual">
              <Link2 size={18} />
              <span>
                <T value="Your request. Ready to share." />
              </span>
              <ArrowUpRight size={18} />
            </div>
          </article>
        </Reveal>
        {[
          {
            icon: ScanLine,
            title: "From screen to scan.",
            copy: "Every published request has a QR code. Open it on another device and pay through your wallet.",
            label: "QR payments",
          },
          {
            icon: Fingerprint,
            title: "A wallet that’s truly yours.",
            copy: "Link MetaMask with a signed ownership challenge. Verification proves control without moving funds.",
            label: "Verified wallets",
          },
          {
            icon: History,
            title: "Keep the whole story.",
            copy: "Find payment activity across devices, with readable receipts and a link to the on-chain transaction.",
            label: "History & receipts",
          },
        ].map(({ icon: Icon, title, copy, label }, index) => (
          <Reveal key={title} className="cp-feature-small" delay={index * 0.08}>
            <article className="cp-feature-card">
              <span className="cp-feature-icon">
                <Icon />
              </span>
              <span className="cp-feature-caption">
                <T value={label} />
              </span>
              <h3>
                <T value={title} />
              </h3>
              <p>
                <T value={copy} />
              </p>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <div className="cp-feature-footnote">
          <ReceiptText size={16} />
          <span>
            <T value="From first request to final receipt. One connected payment experience." />
          </span>
        </div>
      </Reveal>
    </section>
  );
}
