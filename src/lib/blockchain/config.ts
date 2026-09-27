import { isAddress, parseAbi, type Address } from "viem";
import { sepolia } from "viem/chains";

export const chain = sepolia;
export const CONFIRMATIONS = 2;
export const chainPayAbi = parseAbi([
  "function pay(bytes32 paymentId, address merchant) payable",
  "event PaymentCompleted(bytes32 indexed paymentId, address indexed payer, address indexed merchant, uint256 amount, uint256 timestamp)",
]);
export function contractAddress(): Address {
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
