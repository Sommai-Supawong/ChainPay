import { ContactManager } from "@/components/contact/contact-manager";
import { PageHeader } from "@/components/ui/primitives";
export default function ContactsPage() {
  return (
    <>
      <PageHeader
        eyebrow="PAY PEOPLE, NOT ADDRESSES"
        title="Contacts"
        description="Familiar names for the wallets you pay most."
      />
      <ContactManager />
    </>
  );
}
