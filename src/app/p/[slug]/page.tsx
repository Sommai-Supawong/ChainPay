import { T } from "@/i18n";
import { notFound } from "next/navigation";
import { Brand } from "@/components/layout/brand";
import { PublicRequestView } from "@/components/request/public-request";
import { slugSchema } from "@/lib/validation";
import { LanguageToggle } from "@/components/layout/language-toggle";
export default async function PublicPaymentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slugSchema.safeParse(slug).success) notFound();
  return (
    <div className="public-page product-ui">
      <header>
        <Brand />
        <LanguageToggle />
        <span className="badge">
          <T value="No account needed" />
        </span>
      </header>
      <main id="main" className="public-content">
        <PublicRequestView slug={slug} />
      </main>
      <footer>
        <T value="Your wallet. Your control. · Sepolia test ETH only" />
      </footer>
    </div>
  );
}
