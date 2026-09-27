import "server-only";
import { createPublicClient, http } from "viem";
import { chain } from "./config";
import { requireValue } from "@/lib/errors";
export function ethereum() {
  return createPublicClient({
    chain,
    transport: http(
      requireValue(process.env.ETHEREUM_RPC_URL, "Ethereum connection"),
      { timeout: 12_000, retryCount: 1 },
    ),
  });
}
