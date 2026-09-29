"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ellipsis, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "@/i18n";
import { LogoutButton } from "@/components/auth/auth-buttons";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { appNav, appNavActive } from "./app-nav";
import { useTheme } from "@/components/theme/theme-provider";

export function MobileBottomNav({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const t = useTranslation();
  const path = usePathname();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  const moreActive =
    open ||
    appNav.some((item) => !item.mobile && appNavActive(item.href, path));
  const transition = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 340, damping: 30 };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <nav className="mobile-bottom-nav" aria-label={t("Mobile navigation")}>
        <div className="mobile-bottom-nav-inner">
          {appNav
            .filter((item) => item.mobile)
            .map(({ href, shortLabel, icon: Icon }) => {
              const active = appNavActive(href, path);
              return (
                <Link
                  key={href}
                  href={href}
                  className="mobile-nav-item"
                  aria-current={active ? "page" : undefined}
                >
                  {active && !open && (
                    <motion.span
                      layoutId="app-nav-active"
                      className="mobile-nav-bubble"
                      transition={transition}
                    />
                  )}
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.2 : 1.8}
                    aria-hidden="true"
                  />
                  <span>{t(shortLabel)}</span>
                </Link>
              );
            })}
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="mobile-nav-item"
              aria-label={t("More")}
              aria-haspopup="dialog"
              aria-expanded={open}
            >
              {moreActive && (
                <motion.span
                  layoutId="app-nav-active"
                  className="mobile-nav-bubble"
                  transition={transition}
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
          data-theme={theme}
          aria-describedby={undefined}
        >
          <div className="mobile-sheet-handle" aria-hidden="true" />
          <div className="mobile-sheet-heading">
            <div>
              <Dialog.Title>{t("More")}</Dialog.Title>
              <p>{name}</p>
              <small>{email}</small>
            </div>
            <Dialog.Close
              className="mobile-sheet-close"
              aria-label={t("Close navigation")}
            >
              <X size={20} />
            </Dialog.Close>
          </div>
          <nav
            aria-label={t("More") + " " + t("Main navigation")}
            className="mobile-sheet-links"
          >
            {appNav
              .filter((item) => !item.mobile)
              .map(({ href, shortLabel, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={appNavActive(href, path) ? "page" : undefined}
                >
                  <span className="mobile-sheet-icon">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  {t(shortLabel)}
                  <ArrowUpRightIcon />
                </Link>
              ))}
          </nav>
          <div className="mobile-sheet-language">
            <span>{t("Language")}</span>
            <LanguageToggle />
          </div>
          <div className="mobile-sheet-logout">
            <LogoutButton />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ArrowUpRightIcon() {
  return (
    <span className="mobile-sheet-chevron" aria-hidden="true">
      ›
    </span>
  );
}
