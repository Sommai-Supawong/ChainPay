"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";

const links = [
  ["#features", "Product"],
  ["#how-it-works", "How it works"],
  ["#built-for-trust", "Security"],
] as const;
export function SiteNav({ signedIn }: { signedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`cp-nav ${scrolled ? "cp-nav-scrolled" : ""}`}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div className="cp-container cp-nav-inner">
        <Brand />
        <nav className="cp-desktop-nav" aria-label="Main navigation">
          {links.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="cp-nav-actions">
          <Button asChild variant="secondary">
            <Link href={signedIn ? "/dashboard" : "/login"}>
              {signedIn ? "Dashboard" : "Open ChainPay"}
              <ArrowUpRight size={16} />
            </Link>
          </Button>
          <Button
            ref={toggle}
            className="cp-menu-toggle"
            variant="ghost"
            size="icon"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </Button>
        </div>
      </div>
      <nav
        id="mobile-navigation"
        className="cp-mobile-nav cp-container"
        aria-label="Mobile navigation"
        hidden={!open}
      >
        {links.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {label}
            <ArrowUpRight size={16} />
          </a>
        ))}
      </nav>
    </header>
  );
}
