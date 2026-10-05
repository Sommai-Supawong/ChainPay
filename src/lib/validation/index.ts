import { z } from "zod";
import { isAddress, parseEther, zeroAddress } from "viem";

export const addressSchema = z
  .string()
  .refine(
    (v) => isAddress(v) && v.toLowerCase() !== zeroAddress,
    "Enter a valid Ethereum address.",
  )
  .transform((v) => v.toLowerCase() as `0x${string}`);
export const amountSchema = z
  .string()
  .regex(
    /^(0|[1-9]\d{0,17})(\.\d{1,18})?$/,
    "Use a decimal amount with up to 18 decimal places.",
  )
  .refine((v) => {
    try {
      return parseEther(v) > BigInt(0);
    } catch {
      return false;
    }
  }, "Amount must be greater than zero.");
export const hashSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/, "Invalid transaction hash.")
  .transform((v) => v.toLowerCase() as `0x${string}`);
export const idSchema = z.uuid();
export const slugSchema = z.string().regex(/^CP-[a-zA-Z0-9_-]{16,32}$/);
export const paymentSchema = z.object({
  toAddress: addressSchema,
  amount: amountSchema,
  title: z.string().trim().max(100),
  note: z.string().trim().max(500),
});
export const requestSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000),
  amount: amountSchema,
  receiverWalletId: idSchema,
  expiresIn: z.enum(["never", "hour", "day", "week"]),
  status: z.enum(["draft", "active"]),
});
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(80),
  walletAddress: addressSchema,
  label: z.string().trim().max(80),
});
export const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  accountType: z.enum(["personal", "merchant"]),
});
export const themeSchema = z.object({
  theme: z.enum(["dark", "light"]),
});
export const intentSchema = paymentSchema.extend({
  fromAddress: addressSchema,
  slug: slugSchema.optional(),
});
export const submitSchema = z.object({
  intentId: idSchema,
  token: z.string().min(32).max(128),
  hash: hashSchema,
});
export const challengeSchema = z.object({ address: addressSchema });
export const signatureSchema = z.object({
  id: idSchema,
  signature: z.string().regex(/^0x[0-9a-fA-F]{130}$/),
});

export const escrowDraftSchema = z.object({
  freelancerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address").transform(a => a.toLowerCase()),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().default(""),
  milestones: z.array(z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional().default(""),
    amount: amountSchema,
  })).min(1),
});
export type PaymentInput = z.input<typeof paymentSchema>;
export type RequestInput = z.input<typeof requestSchema>;
export type ContactInput = z.input<typeof contactSchema>;
