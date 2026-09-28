"use client";
import { T, useTranslation } from "@/i18n";
import Link from "next/link";
import { BrandLogo } from "./brand-logo";
export function Brand() {
  const t = useTranslation();
  return (
    <Link className="brand" href="/" aria-label={t("ChainPay home")}>
      <span className="brand-mark">
        <BrandLogo />
      </span>
      <T value="ChainPay" />
      <span className="brand-dot">.</span>
    </Link>
  );
}
