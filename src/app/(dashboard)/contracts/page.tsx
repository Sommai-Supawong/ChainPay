import { EscrowList } from "@/components/escrow/escrow-list";
import { PageHeader } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { T } from "@/i18n";
import { escrowContractExplorerUrl } from "@/lib/blockchain/config";

export default function ContractsPage() {
  const explorerUrl = escrowContractExplorerUrl();

  return (
    <>
      <PageHeader
        eyebrow="SECURE AGREEMENTS"
        title="Escrow Contracts"
        description="Manage your milestone-based payment agreements."
        action={
          <div className="button-row">
            {explorerUrl && (
              <Button asChild variant="secondary">
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Smart Contract on block explorer"
                >
                  <ExternalLink size={16} />
                  <T value="View Smart Contract" />
                </a>
              </Button>
            )}
            <Button asChild>
              <Link href="/contracts/new">
                <Plus size={17} />
                <T value="New contract" />
              </Link>
            </Button>
          </div>
        }
      />
      <EscrowList />
    </>
  );
}
