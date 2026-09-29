import { PaymentForm } from "@/components/payment/payment-form";
import { PageHeader } from "@/components/ui/primitives";
import { ScanLink } from "@/components/payment/scan-link";

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const { to } = await searchParams;
  return (
    <>
      <PageHeader
        eyebrow="SEND WITH CONFIDENCE"
        title="Send a payment"
        description="A clear review before anything leaves your wallet."
        action={<ScanLink />}
      />
      <div className="form-width">
        <PaymentForm recipient={to} />
      </div>
    </>
  );
}
