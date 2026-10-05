import { EscrowDetail } from "@/components/escrow/escrow-detail";

export default async function EscrowPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return (
    <div className="narrow-page">
      <EscrowDetail id={id} />
    </div>
  );
}
