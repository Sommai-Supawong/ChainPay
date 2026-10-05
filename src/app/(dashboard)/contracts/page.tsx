import { EscrowList } from "@/components/escrow/escrow-list";
import { PageHeader } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { T } from "@/i18n";

export default function ContractsPage() {
  return (
    <>
      <PageHeader
        eyebrow="SECURE AGREEMENTS"
        title="Escrow Contracts"
        description="Manage your milestone-based payment agreements."
        action={
          <Button asChild>
            <Link href="/contracts/new">
              <Plus size={17} />
              <T value="New contract" />
            </Link>
          </Button>
        }
      />
      <EscrowList />
    </>
  );
}
