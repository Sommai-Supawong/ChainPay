import { T } from "@/i18n";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { Receipt } from "@/components/payment/receipt";
import { Button } from "@/components/ui/button";
import { hashSchema } from "@/lib/validation";
import { LanguageToggle } from "@/components/layout/language-toggle";
export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const parsed = hashSchema.safeParse((await params).hash);
  if (!parsed.success) notFound();
  return (
    <div className="public-page">
      <header>
        <Brand />
        <LanguageToggle />
      </header>
      <main id="main" className="public-content">
        <Button asChild variant="secondary" className="receipt-back-link">
          <Link href="/dashboard">
            <ArrowLeft size={17} aria-hidden="true" />
            <T value="Back to Dashboard" />
          </Link>
        </Button>
        <Receipt hash={parsed.data} />
      </main>
      <footer>
        <T value="Non-custodial payments · Ethereum Sepolia" />
      </footer>
    </div>
  );
}
