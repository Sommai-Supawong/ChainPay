import "server-only";
import { chain } from "./config";
import { AppError } from "@/lib/errors";

const unavailableMessage =
  "Ethereum Sepolia RPC is unavailable. Keep your transaction hash and retry shortly.";

export async function assertSepoliaRpc(client: {
  getChainId(): Promise<number>;
}) {
  let chainId: number;
  try {
    chainId = await client.getChainId();
  } catch {
    throw new AppError(503, unavailableMessage);
  }
  if (chainId !== chain.id)
    throw new AppError(
      503,
      `Ethereum RPC is connected to the wrong network. Expected Sepolia (${chain.id}).`,
    );
}

export async function rpcResult<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch {
    throw new AppError(503, unavailableMessage);
  }
}
