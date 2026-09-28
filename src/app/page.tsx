import { T } from "@/i18n";
import { Wallet, ShieldCheck, ReceiptText } from "lucide-react";
import { SessionNav } from "@/components/marketing/session-actions";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { ProductPreview } from "@/components/marketing/product-preview";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { UseCases } from "@/components/marketing/use-cases";
import { TrustSection } from "@/components/marketing/trust-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { SiteFooter } from "@/components/marketing/site-footer";
import "./marketing.css";

export default function Home() {
  return (
    <div className="cp-home">
      <noscript>
        <style>{`.cp-reveal,.cp-text-line{opacity:1!important;transform:none!important;filter:none!important}`}</style>
      </noscript>
      <SessionNav />
      <main id="main">
        <HeroSection />
        <div className="cp-value-strip cp-container">
          <span>
            <Wallet size={17} /> <T value="Your keys stay yours" />
          </span>
          <span>
            <ShieldCheck size={17} /> <T value="Verified against Ethereum" />
          </span>
          <span>
            <ReceiptText size={17} /> <T value="History that stays with you" />
          </span>
        </div>
        <FeatureGrid />
        <ProductPreview />
        <HowItWorks />
        <TrustSection />
        <UseCases />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
