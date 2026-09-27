import { notFound } from "next/navigation";
import { RequestDetail } from "@/components/request/request-manager";
import { PageHeader } from "@/components/ui/primitives";
import { idSchema } from "@/lib/validation";
export default async function RequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  return (
    <>
      <PageHeader
        title="Request details"
        description="Share it. Track it. Keep things clear."
      />
      <div className="form-width">
        <RequestDetail id={id} />
      </div>
    </>
  );
}
