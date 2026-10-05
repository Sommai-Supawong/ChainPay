import { EscrowForm } from "@/components/escrow/escrow-form";
import { PageHeader } from "@/components/ui/primitives";

export default function NewContractPage() {
  return (
    <div className="narrow-page">
      <PageHeader
        eyebrow="ESCROW AGREEMENT"
        title="Create a contract"
        description="Define milestones and lock funds securely."
      />
      <EscrowForm />
    </div>
  );
}
