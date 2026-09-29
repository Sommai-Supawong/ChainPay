"use client";
import { T, useErrorTranslation, useTranslation } from "@/i18n";
import {
  useConnect,
  useConnectors,
  useConnection,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { toast } from "sonner";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chain } from "@/lib/blockchain/config";
import { shortAddress } from "@/lib/utils";
import { friendlyError } from "@/lib/client-api";
export function ConnectWallet() {
  const t = useTranslation();
  const errorText = useErrorTranslation();
  const { address, chainId, isConnected } = useConnection();
  const connectors = useConnectors();
  const connect = useConnect(),
    disconnect = useDisconnect(),
    network = useSwitchChain();
  if (!isConnected)
    return (
      <Button
        variant="secondary"
        disabled={connect.isPending}
        onClick={async () => {
          try {
            const connector =
              connectors.find((c) => c.id === "metaMask") ?? connectors[0];
            if (!connector || !(await connector.getProvider()))
              throw new Error(
                "MetaMask was not detected. Install it or open this page in the MetaMask browser.",
              );
            await connect.mutateAsync({ connector });
          } catch (error) {
            toast.error(errorText(friendlyError(error)));
          }
        }}
      >
        <Wallet size={17} />
        {t(connect.isPending ? "Connecting wallet…" : "Connect MetaMask")}
      </Button>
    );
  return (
    <div className="connected-wallet">
      <span className="address">{shortAddress(address!)}</span>
      {chainId !== chain.id ? (
        <Button
          variant="secondary"
          disabled={network.isPending}
          onClick={async () => {
            try {
              await network.mutateAsync({ chainId: chain.id });
            } catch (error) {
              toast.error(errorText(friendlyError(error)));
            }
          }}
        >
          {t(network.isPending ? "Switching…" : "Switch to Sepolia")}
        </Button>
      ) : (
        <span className="badge badge-success">
          <T value="Sepolia" />
        </span>
      )}
      <Button variant="ghost" size="sm" onClick={() => disconnect.mutate()}>
        <T value="Disconnect" />
      </Button>
    </div>
  );
}
