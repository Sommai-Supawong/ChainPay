"use client";

import Link from "next/link";
import { T, useTranslation } from "@/i18n";
import { UserRound, ShieldCheck, Palette, ChevronRight } from "lucide-react";

export function SettingsTabs({
  current,
}: {
  current: "profile" | "security" | "theme";
}) {
  const t = useTranslation();
  return (
    <nav className="settings-tabs" aria-label={t("Settings")}>
      {[
        {
          key: "profile",
          href: "/settings/profile",
          label: "Profile",
          description: "Your account details",
          icon: UserRound,
        },
        {
          key: "security",
          href: "/settings/security",
          label: "Security",
          description: "Sign-in and wallet security",
          icon: ShieldCheck,
        },
        {
          key: "theme",
          href: "/settings/theme",
          label: "Theme",
          description: "Make ChainPay feel like you",
          icon: Palette,
        },
      ].map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={current === item.key ? "page" : undefined}
        >
          <item.icon size={19} aria-hidden="true" />
          <div>
            <strong>
              <T value={item.label} />
            </strong>
            <small>
              <T value={item.description} />
            </small>
          </div>
          <ChevronRight
            size={15}
            className="settings-chevron"
            aria-hidden="true"
          />
        </Link>
      ))}
    </nav>
  );
}
