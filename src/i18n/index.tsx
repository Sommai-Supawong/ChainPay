"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translate } from "./messages";
import type { Language } from "./types";

export type { Language } from "./types";

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
}>({ language: "en", setLanguage: () => {} });

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage: Language;
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translate(language, "ChainPay — Payments, made clear");
  }, [language]);

  function chooseLanguage(next: Language) {
    setLanguage(next);
    document.cookie = `chainpay-language=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: chooseLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useLocale() {
  return useLanguage().language === "th" ? "th-TH" : "en-US";
}

export function useTranslation() {
  const { language } = useLanguage();
  return (key: string, values?: Record<string, string | number>) =>
    translate(language, key, values);
}

export function T({
  value,
  values,
}: {
  value: string;
  values?: Record<string, string | number>;
}) {
  const t = useTranslation();
  return t(value, values);
}
