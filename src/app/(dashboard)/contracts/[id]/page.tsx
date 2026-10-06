import { EscrowDetail } from "@/components/escrow/escrow-detail";
import { pageUser } from "@/lib/auth/session";

export default async function EscrowPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await pageUser();
  return (
    <div className="narrow-page">
      <EscrowDetail id={id} currentUserId={user.id} />
    </div>
  );
}
