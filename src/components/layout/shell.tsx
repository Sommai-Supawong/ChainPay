"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  LayoutDashboard,
  ReceiptText,
  Wallet,
  UsersRound,
  Settings2,
  Activity,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Brand } from "./brand";
import { LogoutButton } from "@/components/auth/auth-buttons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
const links = [
  { href: "/dashboard", text: "Overview", icon: LayoutDashboard },
  { href: "/pay", text: "Send payment", icon: ArrowUpRight },
  { href: "/requests", text: "Payment requests", icon: ReceiptText },
  { href: "/activity", text: "Activity", icon: Activity },
  { href: "/wallets", text: "Wallets", icon: Wallet },
  { href: "/contacts", text: "Contacts", icon: UsersRound },
  { href: "/settings/profile", text: "Settings", icon: Settings2 },
];
export function AppShell({
  children,
  name,
  email,
}: {
  children: React.ReactNode;
  name: string;
  email: string;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell">
      <header className="mobile-header">
        <Brand />
        <Button
          variant="ghost"
          size="icon"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </header>
      <aside className={cn("sidebar", open && "sidebar-open")}>
        <div className="sidebar-brand">
          <Brand />
        </div>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav aria-label="Main navigation">
          {links.map(({ href, text, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "nav-link",
                (path === href ||
                  (href === "/requests" && path.startsWith("/request/")) ||
                  (href === "/settings/profile" &&
                    path.startsWith("/settings/"))) &&
                  "nav-active",
              )}
              aria-current={path === href ? "page" : undefined}
            >
              <Icon size={19} />
              {text}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="network-card">
            <span className="network-dot" />
            Ethereum Sepolia<p>Test network · Test ETH only</p>
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
            Your keys. Your control.
          </span>
          <span className="badge">Sepolia testnet</span>
        </div>
        <main id="main" className="workspace-main">
          {children}
        </main>
        <footer className="workspace-footer">
          ChainPay <span>Payments, made clear.</span>
          <span>Non-custodial by design</span>
        </footer>
      </div>
    </div>
  );
}
