"use client";

import { useLanguage, useTranslation } from "@/i18n";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();

  return (
    <div
      className="language-toggle"
      role="group"
      aria-label={t("Change language")}
    >
      <span
        className="language-toggle-indicator"
        data-language={language}
        aria-hidden="true"
      />
      {(["en", "th"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-label={t(
            option === "en" ? "Switch to English" : "Switch to Thai",
          )}
          aria-pressed={language === option}
          onClick={() => setLanguage(option)}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
