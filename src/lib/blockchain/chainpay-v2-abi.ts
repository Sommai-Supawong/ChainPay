import { parseAbi } from "viem";

export const chainPayV2Abi = parseAbi([
  "function pay(bytes32 paymentId, address merchant) payable",
  "function version() pure returns (uint256)",
  "function completed(bytes32 key) view returns (bool)",
  "event PaymentCompleted(bytes32 indexed paymentId, address indexed payer, address indexed merchant, uint256 amount, uint256 timestamp)",
  "error ZeroAmount()",
  "error InvalidMerchant()",
  "error InvalidPaymentId()",
  "error AlreadyPaid()",
  "error TransferFailed()",
  "error Reentrancy()",
]);
