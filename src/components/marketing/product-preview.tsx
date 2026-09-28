"use client";
import { T } from "@/i18n";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import {
  ArrowUpRight,
  ShieldCheck,
  Link2,
  Wallet,
  ReceiptText,
  LayoutDashboard,
  Send,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";
import { GlassCard, EmptyState } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/reveal";
import { TextEmerge } from "@/components/motion/text-emerge";
import { useTranslation } from "@/i18n";

const tabs = ["Send", "Request", "Activity"] as const;
type PreviewTab = (typeof tabs)[number];

export function ProductPreview() {
  const t = useTranslation();
  const [tab, setTab] = useState<PreviewTab>("Send");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const rotateX = useSpring(y, { stiffness: 90, damping: 24 });
  const rotateY = useSpring(x, { stiffness: 90, damping: 24 });
  return (
    <section
      id="product-preview"
      className="cp-section cp-container cp-preview-section"
      aria-labelledby="preview-heading"
    >
      <Reveal className="cp-preview-copy">
        <p className="eyebrow">
          <T value="A LITTLE MORE FAMILIAR" />
        </p>
        <div id="preview-heading">
          <TextEmerge
            lines={["Everything in its place.", "Including peace of mind."]}
          />
        </div>
        <p className="cp-section-intro">
          <T value="A thoughtful workspace for the moments before, during, and after you pay." />
        </p>
        <ul className="cp-check-list">
          <li>
            <ShieldCheck size={18} />{" "}
            <T value="Review before your wallet signs" />
          </li>
          <li>
            <Link2 size={18} /> <T value="Requests that are easy to share" />
          </li>
          <li>
            <ReceiptText size={18} />{" "}
            <T value="Receipts you can independently check" />
          </li>
        </ul>
        <a className="text-link" href="#how-it-works">
          <T value="Meet your new payment flow" />
          <ArrowUpRight size={17} />
        </a>
      </Reveal>
      <Reveal className="cp-preview-stage">
        <div
          className="cp-preview-pointer"
          onPointerMove={(event) => {
            if (reduced || event.pointerType !== "mouse") return;
            const rect = event.currentTarget.getBoundingClientRect();
            x.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
            y.set(-((event.clientY - rect.top) / rect.height - 0.5) * 2);
          }}
          onPointerLeave={() => {
            x.set(0);
            y.set(0);
          }}
        >
          <motion.div
            style={{
              rotateX: reduced ? 0 : rotateX,
              rotateY: reduced ? 0 : rotateY,
            }}
          >
            <GlassCard className="cp-product-window">
              <div className="cp-window-bar">
                <span>
                  <span className="cp-preview-brand-mark">
                    <BrandLogo />
                  </span>{" "}
                  <T value="ChainPay" />
                </span>
                <span className="cp-preview-label">
                  <T value="INTERFACE PREVIEW" />
                </span>
              </div>
              <div className="cp-preview-workspace">
                <div className="cp-preview-rail" aria-hidden="true">
                  <LayoutDashboard />
                  <Send />
                  <Wallet />
                  <Clock3 />
                </div>
                <div className="cp-preview-body">
                  <div className="cp-preview-title">
                    <h3>
                      <T value="Your payments" />
                    </h3>
                    <span className="badge">
                      <T value="Sepolia" />
                    </span>
                  </div>
                  <div
                    role="tablist"
                    aria-label={t("Explore the payment interface")}
                    className="cp-preview-tabs"
                  >
                    {tabs.map((name, index) => (
                      <button
                        key={name}
                        ref={(el) => {
                          tabRefs.current[index] = el;
                        }}
                        id={`preview-tab-${name}`}
                        type="button"
                        role="tab"
                        aria-selected={tab === name}
                        aria-controls="preview-panel"
                        tabIndex={tab === name ? 0 : -1}
                        onClick={() => setTab(name)}
                        onKeyDown={(event) => {
                          let next = index;
                          if (event.key === "ArrowRight")
                            next = (index + 1) % tabs.length;
                          else if (event.key === "ArrowLeft")
                            next = (index + tabs.length - 1) % tabs.length;
                          else if (event.key === "Home") next = 0;
                          else if (event.key === "End") next = tabs.length - 1;
                          else return;
                          event.preventDefault();
                          setTab(tabs[next]);
                          tabRefs.current[next]?.focus();
                        }}
                      >
                        {t(name)}
                      </button>
                    ))}
                  </div>
                  <div
                    role="tabpanel"
                    id="preview-panel"
                    aria-labelledby={`preview-tab-${tab}`}
                    tabIndex={0}
                    className="cp-preview-panel"
                  >
                    {tab === "Send" ? (
                      <>
                        <div className="cp-preview-field">
                          <span>
                            <T value="Recipient" />
                          </span>
                          <div>
                            <Wallet size={16} />{" "}
                            <T value="A wallet address or saved contact" />
                          </div>
                        </div>
                        <div className="cp-preview-field">
                          <span>
                            <T value="Amount" />
                          </span>
                          <div>
                            <span className="cp-placeholder">
                              <T value="Enter an amount" />
                            </span>
                            <b>
                              <T value="ETH" />
                            </b>
                          </div>
                        </div>
                        <p className="cp-preview-hint">
                          <ShieldCheck size={14} />{" "}
                          <T value="Review the details before signing." />
                        </p>
                        <Button asChild className="full-width">
                          <Link href="/pay">
                            <T value="Open send payment" />
                            <ArrowUpRight size={16} />
                          </Link>
                        </Button>
                      </>
                    ) : tab === "Request" ? (
                      <>
                        <div className="cp-preview-field">
                          <span>
                            <T value="What’s it for?" />
                          </span>
                          <div>
                            <T value="A description your payer will recognize" />
                          </div>
                        </div>
                        <div className="cp-preview-request">
                          <Link2 size={28} />
                          <p>
                            <T value="Set an amount." />
                            <br />
                            <T value="Publish a link. Share it anywhere." />
                          </p>
                        </div>
                        <Button asChild className="full-width">
                          <Link href="/request/new">
                            <T value="Create a payment request" />
                            <ArrowUpRight size={16} />
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <EmptyState
                        title="A home for your payment history"
                        description="Your saved payments and their receipts appear here when you use ChainPay."
                        href="/activity"
                        action="Open activity"
                      />
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
          <div className="cp-preview-note">
            <span className="cp-feature-icon">
              <ShieldCheck size={21} />
            </span>
            <div>
              <strong>
                <T value="Your keys stay yours." />
              </strong>
              <p>
                <T value="Payments are approved in your wallet." />
              </p>
            </div>
          </div>
        </div>
        <p className="cp-preview-disclaimer">
          <T value="Explore the interface · No connected account or live payment data" />
        </p>
      </Reveal>
    </section>
  );
}
