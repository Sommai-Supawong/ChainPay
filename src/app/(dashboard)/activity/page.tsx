import { ActivityList } from "@/components/activity/activity-list";
import { PageHeader } from "@/components/ui/primitives";
export default function ActivityPage() {
  return (
    <>
      <PageHeader
        eyebrow="EVERY PAYMENT, IN ONE PLACE"
        title="Activity"
        description="A clear record of what you’ve sent and received."
      />
      <ActivityList />
    </>
  );
}
