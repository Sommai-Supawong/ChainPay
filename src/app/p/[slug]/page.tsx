import { notFound } from "next/navigation";
import { Brand } from "@/components/layout/brand";
import { PublicRequestView } from "@/components/request/public-request";
import { slugSchema } from "@/lib/validation";
export default async function PublicPaymentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slugSchema.safeParse(slug).success) notFound();
  return (
    <div className="public-page">
      <header>
        <Brand />
        <span className="badge">No account needed</span>
      </header>
      <main id="main" className="public-content">
        <PublicRequestView slug={slug} />
      </main>
      <footer>Your wallet. Your control. · Sepolia test ETH only</footer>
    </div>
  );
}
