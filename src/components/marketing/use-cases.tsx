import { UserRound, BriefcaseBusiness, Store, Compass } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TextEmerge } from "@/components/motion/text-emerge";

export function UseCases() {
  return (
    <section
      className="cp-section cp-container"
      aria-labelledby="use-cases-heading"
    >
      <div className="cp-section-heading">
        <div id="use-cases-heading">
          <p className="eyebrow">FAMILIAR NEEDS. A NEW WAY TO PAY.</p>
          <TextEmerge
            lines={["Built around people.", "Not just wallet addresses."]}
          />
        </div>
        <Reveal>
          <p className="cp-section-intro">
            Explore everyday payment workflows
            <br />
            on Ethereum Sepolia.
          </p>
        </Reveal>
      </div>
      <div className="cp-use-cases">
        {[
          {
            icon: UserRound,
            title: "For individuals",
            text: "Save a contact, send a payment, and find the receipt without digging through a block explorer.",
          },
          {
            icon: BriefcaseBusiness,
            title: "For freelancers",
            text: "Give a project milestone its own payment link, description, and easy-to-follow status.",
          },
          {
            icon: Store,
            title: "For small merchants",
            text: "Create separate requests for orders. Share a QR code and keep payment records organized.",
          },
          {
            icon: Compass,
            title: "For the Web3 curious",
            text: "Learn the flow with test ETH, clear review screens, and a wallet that stays in your hands.",
          },
        ].map(({ icon: Icon, title, text }, index) => (
          <Reveal key={title} delay={index * 0.06}>
            <article>
              <Icon size={23} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
