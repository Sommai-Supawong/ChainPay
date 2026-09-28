import { parseAbi } from "viem";

export const chainPayV1Abi = parseAbi([
  "function pay(bytes32 paymentId, address merchant) payable",
  "event PaymentCompleted(bytes32 indexed paymentId, address indexed payer, address indexed merchant, uint256 amount, uint256 timestamp)",
]);
