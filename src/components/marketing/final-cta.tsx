import { T } from "@/i18n";
import { ArrowRight, Plus } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TextEmerge } from "@/components/motion/text-emerge";
import { SessionCta } from "./session-actions";

export function FinalCta() {
  return (
    <>
      <section
        id="help"
        className="cp-section cp-container cp-help"
        aria-labelledby="help-heading"
      >
        <div id="help-heading">
          <p className="eyebrow">
            <T value="A FEW THINGS TO KNOW" />
          </p>
          <TextEmerge lines={["Clear from the start."]} />
        </div>
        <div className="cp-faq">
          {[
            [
              "What do I need to get started?",
              "Sign in with Google, connect MetaMask, and verify your wallet. To try a payment, select Ethereum Sepolia and add test ETH to cover the payment and network fee.",
            ],
            [
              "Can I use real ETH?",
              "ChainPay currently supports Ethereum Sepolia only. Use Sepolia test ETH, which has no monetary value. Mainnet, fiat payments, and tokens are not supported.",
            ],
            [
              "Does someone need an account to pay my link?",
              "No. Anyone with a compatible MetaMask wallet and enough Sepolia test ETH can open an active public request, review the details, and approve the payment.",
            ],
            [
              "Does ChainPay hold my funds?",
              "No. You approve payments in MetaMask. The payment contract forwards ETH to the recipient; ChainPay does not store your private keys or seed phrase.",
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>
                <T value={question} />
                <Plus size={18} />
              </summary>
              <p>
                <T value={answer} />
              </p>
            </details>
          ))}
        </div>
      </section>
      <section
        className="cp-final cp-container"
        aria-labelledby="final-heading"
      >
        <div className="cp-final-orbit" aria-hidden="true" />
        <p className="eyebrow">
          <T value="YOUR NEXT PAYMENT, SIMPLIFIED" />
        </p>
        <div id="final-heading">
          <TextEmerge lines={["Less friction.", "More connection."]} />
        </div>
        <Reveal>
          <p>
            <T value="Create your account, connect a wallet, and explore" />
            <br className="cp-desktop-break" />{" "}
            <T value="a more thoughtful way to pay." />
          </p>
          <div className="cp-hero-buttons">
            <SessionCta />
            <a className="text-link" href="#how-it-works">
              <T value="Learn how it works" />
              <ArrowRight size={16} />
            </a>
          </div>
          <small>
            <T value="Ethereum Sepolia · Test ETH only" />
          </small>
        </Reveal>
      </section>
    </>
  );
}
