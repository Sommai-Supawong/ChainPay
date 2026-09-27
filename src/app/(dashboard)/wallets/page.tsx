import { PageHeader } from "@/components/ui/primitives";
import { WalletManager } from "@/components/wallet/wallet-manager";
export default function WalletsPage() {
  return (
    <>
      <PageHeader
        eyebrow="CONNECTED, SECURELY"
        title="Your wallets"
        description="Keep your keys. Connect your accounts."
      />
      <WalletManager />
    </>
  );
}
