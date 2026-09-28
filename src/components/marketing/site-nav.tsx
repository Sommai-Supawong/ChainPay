"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Ellipsis, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { marketingNav } from "@/components/navigation/marketing-nav";
import { useTranslation } from "@/i18n";

export function SiteNav({ signedIn }: { signedIn: boolean }) {
  const t = useTranslation();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#");
  const [open, setOpen] = useState(false);
  const destination = signedIn ? "/dashboard" : "/login";

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const current = [...marketingNav]
        .reverse()
        .find(
          ({ href }) =>
            href !== "#" &&
            (document.querySelector(href)?.getBoundingClientRect().top ??
              Infinity) <=
              window.innerHeight * 0.38,
        );
      setActive(current?.href ?? "#");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <header className={`cp-nav ${scrolled ? "cp-nav-scrolled" : ""}`}>
        <div className="cp-container cp-nav-inner">
          <Brand />
          <nav className="cp-desktop-nav" aria-label={t("Main navigation")}>
            {marketingNav
              .filter((item) => item.desktop)
              .map(({ href, label }) => (
                <a key={href} href={href}>
                  {t(label)}
                </a>
              ))}
          </nav>
          <div className="cp-nav-actions">
            <LanguageToggle />
            <Button asChild variant="secondary">
              <Link href={destination}>
                {signedIn ? t("Dashboard") : t("Open ChainPay")}
                <ArrowUpRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <nav
        className="mobile-bottom-nav marketing-bottom-nav"
        aria-label={t("Mobile navigation")}
      >
        <div className="mobile-bottom-nav-inner">
          {marketingNav.map(({ href, shortLabel, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="mobile-nav-item"
              aria-current={active === href ? "location" : undefined}
              onClick={() => setActive(href)}
            >
              {active === href && !open && (
                <motion.span
                  layoutId="marketing-nav-active"
                  className="mobile-nav-bubble"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 340, damping: 30 }
                  }
                />
              )}
              <Icon size={20} aria-hidden="true" />
              <span>{t(shortLabel)}</span>
            </a>
          ))}
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="mobile-nav-item"
              aria-label={t("More")}
              aria-haspopup="dialog"
              aria-expanded={open}
            >
              {open && (
                <motion.span
                  layoutId="marketing-nav-active"
                  className="mobile-nav-bubble"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 340, damping: 30 }
                  }
                />
              )}
              <Ellipsis size={21} aria-hidden="true" />
              <span>{t("More")}</span>
            </button>
          </Dialog.Trigger>
        </div>
      </nav>
      <Dialog.Portal>
        <Dialog.Overlay className="mobile-sheet-overlay" />
        <Dialog.Content
          className="mobile-more-sheet"
          aria-describedby={undefined}
        >
          <div className="mobile-sheet-handle" aria-hidden="true" />
          <div className="mobile-sheet-heading">
            <Dialog.Title>{t("More")}</Dialog.Title>
            <Dialog.Close
              className="mobile-sheet-close"
              aria-label={t("Close navigation")}
            >
              <X size={20} />
            </Dialog.Close>
          </div>
          <div className="mobile-sheet-links">
            <Link href={destination} onClick={() => setOpen(false)}>
              <span className="mobile-sheet-icon">
                <ArrowUpRight size={19} />
              </span>
              {signedIn ? t("Dashboard") : t("Open ChainPay")}
              <span className="mobile-sheet-chevron" aria-hidden="true">
                ›
              </span>
            </Link>
          </div>
          <div className="mobile-sheet-language">
            <span>{t("Language")}</span>
            <LanguageToggle />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
