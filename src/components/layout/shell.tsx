"use client";
import { T } from "@/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Brand } from "./brand";
import { LogoutButton } from "@/components/auth/auth-buttons";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./language-toggle";
import { useTranslation } from "@/i18n";
import { appNav, appNavActive } from "@/components/navigation/app-nav";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { useTheme } from "@/components/theme/theme-provider";
import { Toaster } from "sonner";
export function AppShell({
  children,
  name,
  email,
}: {
  children: React.ReactNode;
  name: string;
  email: string;
}) {
  const t = useTranslation();
  const path = usePathname();
  const { theme } = useTheme();
  return (
    <div className="app-shell product-ui" data-theme={theme}>
      <header className="mobile-header">
        <Brand />
        <LanguageToggle />
      </header>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Brand />
        </div>
        <div className="sidebar-language">
          <LanguageToggle />
        </div>
        <div className="workspace-label">
          <T value="YOUR WORKSPACE" />
        </div>
        <nav aria-label={t("Main navigation")}>
          {appNav
            .filter((item) => !item.secondaryOnly)
            .map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "nav-link",
                  (appNavActive(href, path) ||
                    (href === "/settings/profile" &&
                      path.startsWith("/settings/"))) &&
                    "nav-active",
                )}
                aria-current={
                  appNavActive(href, path) ||
                  (href === "/settings/profile" &&
                    path.startsWith("/settings/"))
                    ? "page"
                    : undefined
                }
              >
                <Icon size={19} />
                {t(label)}
              </Link>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="network-card">
            <span className="network-dot" />
            <T value="Ethereum Sepolia" />
            <p>
              <T value="Test network · Test ETH only" />
            </p>
          </div>
          <div className="account-chip">
            <span className="avatar">{name.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{name}</strong>
              <small>{email}</small>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <div className="workspace">
        <div className="workspace-topbar">
          <span>
            <ShieldCheck size={15} />
            <T value="Your keys. Your control." />
          </span>
          <span className="badge">
            <T value="Sepolia testnet" />
          </span>
        </div>
        <main id="main" className="workspace-main">
          {children}
        </main>
        <footer className="workspace-footer">
          <T value="ChainPay" />
          <span>
            <T value="Payments, made clear." />
          </span>
          <span>
            <T value="Non-custodial by design" />
          </span>
        </footer>
      </div>
      <MobileBottomNav name={name} email={email} />
      <Toaster
        className="chainpay-toaster"
        theme={theme}
        richColors
        closeButton
      />
    </div>
  );
}
