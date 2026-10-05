import { isAddress, type Address } from "viem";
import { sepolia } from "viem/chains";
import { chainPayV2Abi } from "./chainpay-v2-abi";

export const chain = sepolia;
export const CONFIRMATIONS = 2;
export const ACTIVE_CONTRACT_VERSION = 2 as const;
export const chainPayAbi = chainPayV2Abi;
export function contractAddress(): Address {
  if (process.env.NEXT_PUBLIC_CHAINPAY_CONTRACT_VERSION !== "2")
    throw new Error(
      "ChainPay V2 is not configured. Set the active contract version to 2.",
    );
  const value = process.env.NEXT_PUBLIC_CHAINPAY_CONTRACT_ADDRESS;
  if (!value || !isAddress(value) || /^0x0{40}$/i.test(value)) {
    throw new Error(
      "Payments are not configured yet. Please contact the operator.",
    );
  }
  return value;
}
export const explorerTx = (hash: string) =>
  `${chain.blockExplorers.default.url}/tx/${hash}`;
export const explorerAddress = (address: string) =>
  `${chain.blockExplorers.default.url}/address/${address}`;

export function escrowContractAddress(): Address {
  const value = process.env.NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS;
  if (!value || !isAddress(value) || /^0x0{40}$/i.test(value)) {
    throw new Error(
      "Escrow contract is not configured yet. Please contact the operator.",
    );
  }
  return value;
}
