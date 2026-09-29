"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { marketingNav } from "@/components/navigation/marketing-nav";
import { MarketingBottomNav } from "./marketing-bottom-nav";
import { useTranslation } from "@/i18n";

export function SiteNav({
  signedIn,
  showMobileNav = true,
}: {
  signedIn: boolean;
  showMobileNav?: boolean;
}) {
  const t = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const destination = signedIn ? "/dashboard" : "/login";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
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
      {showMobileNav && <MarketingBottomNav signedIn={signedIn} />}
    </>
  );
}
