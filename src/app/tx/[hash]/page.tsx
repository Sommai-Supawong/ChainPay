import { notFound } from "next/navigation";
import { Brand } from "@/components/layout/brand";
import { Receipt } from "@/components/payment/receipt";
import { hashSchema } from "@/lib/validation";
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
      </header>
      <main id="main" className="public-content">
        <Receipt hash={parsed.data} />
      </main>
      <footer>Non-custodial payments · Ethereum Sepolia</footer>
    </div>
  );
}
