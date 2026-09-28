import "server-only";
import { isAddress, type Address } from "viem";
import { chainPayV1Abi } from "./chainpay-v1-abi";
import { chainPayV2Abi } from "./chainpay-v2-abi";
import { contractAddress } from "./config";
import { AppError } from "@/lib/errors";

export type ContractVersion = 1 | 2;

export function legacyContractAddress(): Address {
  const value = process.env.CHAINPAY_V1_CONTRACT_ADDRESS;
  if (!value || !isAddress(value) || /^0x0{40}$/i.test(value))
    throw new Error("Historical ChainPay V1 address is not configured.");
  return value;
}

export function contractForVersion(
  version: number,
  storedAddress?: string | null,
) {
  if (version !== 1 && version !== 2)
    throw new AppError(
      503,
      "This payment uses an unsupported ChainPay contract version.",
    );
  const configured =
    version === 1 ? legacyContractAddress() : contractAddress();
  if (storedAddress && storedAddress.toLowerCase() !== configured.toLowerCase())
    throw new AppError(
      503,
      "Payment contract configuration does not match this transaction. Contact the operator.",
    );
  return {
    version: version as ContractVersion,
    address: configured,
    abi: version === 1 ? chainPayV1Abi : chainPayV2Abi,
  };
}
