"use client";

import Link from "next/link";
import { T, useTranslation } from "@/i18n";

export function SettingsTabs({
  current,
}: {
  current: "profile" | "security" | "theme";
}) {
  const t = useTranslation();
  return (
    <nav className="settings-tabs" aria-label={t("Settings")}>
      {[
        { key: "profile", href: "/settings/profile", label: "Profile" },
        { key: "security", href: "/settings/security", label: "Security" },
        { key: "theme", href: "/settings/theme", label: "Theme" },
      ].map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={current === item.key ? "page" : undefined}
        >
          <T value={item.label} />
        </Link>
      ))}
    </nav>
  );
}
