import { RequestForm } from "@/components/request/request-manager";
import { PageHeader } from "@/components/ui/primitives";
export default function NewRequestPage() {
  return (
    <>
      <PageHeader
        eyebrow="CREATE A PAYMENT LINK"
        title="Request a payment"
        description="A little context makes getting paid a little easier."
      />
      <div className="form-width">
        <RequestForm />
      </div>
    </>
  );
}
