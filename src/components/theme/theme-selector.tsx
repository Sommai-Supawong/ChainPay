"use client";

import { useState } from "react";
import { Moon, Sun, Check } from "lucide-react";
import { toast } from "sonner";
import { T, useTranslation } from "@/i18n";
import { friendlyError } from "@/lib/client-api";
import { useTheme, type Theme } from "./theme-provider";

export function ThemeSelector() {
  const { theme, changeTheme } = useTheme();
  const t = useTranslation();
  const [saving, setSaving] = useState(false);
  async function select(next: Theme) {
    if (saving || next === theme) return;
    setSaving(true);
    try {
      await changeTheme(next);
    } catch (error) {
      toast.error(t(friendlyError(error)));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="theme-options" role="group" aria-label={t("Appearance")}>
      {(
        [
          { value: "dark", label: "Dark", icon: Moon },
          { value: "light", label: "Light", icon: Sun },
        ] as const
      ).map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          className="theme-option"
          data-selected={theme === value}
          aria-pressed={theme === value}
          disabled={saving}
          onClick={() => void select(value)}
        >
          <span
            className={`theme-preview theme-preview-${value}`}
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
          </span>
          <span className="theme-option-label">
            <Icon size={18} aria-hidden="true" />
            <T value={label} />
            {theme === value && <Check size={17} aria-hidden="true" />}
          </span>
        </button>
      ))}
    </div>
  );
}
