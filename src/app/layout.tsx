import { T } from "@/i18n";
import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import { cookies } from "next/headers";
import { Providers } from "@/components/providers";
import { translate } from "@/i18n/messages";
import type { Language } from "@/i18n/types";
import "./globals.css";
import "./product.css";

const kanit = Kanit({
  weight: ["400", "500", "600", "700"],
  subsets: ["thai"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  variable: "--font-thai",
});

async function requestLanguage(): Promise<Language> {
  return (await cookies()).get("chainpay-language")?.value === "th"
    ? "th"
    : "en";
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await requestLanguage();
  return {
    title: {
      default: translate(language, "ChainPay — Payments, made clear"),
      template: "%s · ChainPay",
    },
    description: translate(
      language,
      "A simpler way to send, request, and track Ethereum payments. Non-custodial. Built on Sepolia.",
    ),
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = await requestLanguage();
  return (
    <html
      lang={language}
      className={kanit.variable}
      data-scroll-behavior="smooth"
    >
      <body>
        <Providers initialLanguage={language}>
          <a className="skip-link" href="#main">
            <T value="Skip to content" />
          </a>
          {children}
        </Providers>
      </body>
    </html>
  );
}
