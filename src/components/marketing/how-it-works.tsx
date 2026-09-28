import { T } from "@/i18n";
import { LogIn, Fingerprint, ArrowUpRight, ReceiptText } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TextEmerge } from "@/components/motion/text-emerge";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="cp-section cp-container"
      aria-labelledby="workflow-heading"
    >
      <div className="cp-centered-heading" id="workflow-heading">
        <p className="eyebrow">
          <T value="FROM HELLO TO PAYMENT HISTORY" />
        </p>
        <TextEmerge lines={["Four steps. One simpler flow."]} />
        <p className="cp-section-intro">
          <T value="Start with an account. Stay in control with your wallet." />
        </p>
      </div>
      <div className="cp-steps">
        {[
          {
            icon: LogIn,
            title: "Make yourself at home",
            copy: "Continue with Google to keep your wallets, requests, and history together.",
            label: "Sign in",
          },
          {
            icon: Fingerprint,
            title: "Connect. Then verify.",
            copy: "Connect MetaMask and sign a message to prove wallet ownership. No funds move.",
            label: "Connect & verify",
          },
          {
            icon: ArrowUpRight,
            title: "Send it. Or request it.",
            copy: "Review a payment before signing, or share a request by link or QR code.",
            label: "Send or request",
          },
          {
            icon: ReceiptText,
            title: "Know where it stands",
            copy: "ChainPay checks Ethereum confirmations and saves a readable payment record.",
            label: "Verify & track",
          },
        ].map(({ icon: Icon, title, copy, label }, index) => (
          <Reveal key={title} delay={index * 0.09}>
            <article className="cp-step">
              <div className="cp-step-top">
                <span className="cp-step-icon">
                  <Icon size={22} />
                </span>
                <span className="cp-step-number">0{index + 1}</span>
              </div>
              <p className="cp-step-label">
                <T value={label} />
              </p>
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
    </section>
  );
}
