import { T } from "@/i18n";
import Link from "next/link";
import { Plus } from "lucide-react";
import { RequestList } from "@/components/request/request-manager";
import { PageHeader } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
export default function RequestsPage() {
  return (
    <>
      <PageHeader
        eyebrow="A SIMPLE WAY TO GET PAID"
        title="Payment requests"
        description="One link. All the details. Ready to share."
        action={
          <Button asChild>
            <Link href="/request/new">
              <Plus size={17} />
              <T value="New request" />
            </Link>
          </Button>
        }
      />
      <RequestList />
    </>
  );
}
