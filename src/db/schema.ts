import { sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  bigint,
  jsonb,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";

const dates = () => ({
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const requestStatus = pgEnum("request_status", [
  "draft",
  "active",
  "pending",
  "paid",
  "expired",
  "cancelled",
]);
export const transactionStatus = pgEnum("transaction_status", [
  "pending",
  "confirmed",
  "failed",
]);
export const accountType = pgEnum("account_type", ["personal", "merchant"]);
export const themePreference = pgEnum("theme_preference", ["dark", "light"]);
export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text().notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  accountType: accountType("account_type").default("personal").notNull(),
  themePreference: themePreference("theme_preference")
    .default("dark")
    .notNull(),
  ...dates(),
});
export const wallets = pgTable(
  "wallets",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    address: text().notNull(),
    chainId: integer("chain_id").notNull(),
    label: text().notNull().default("MetaMask"),
    isPrimary: boolean("is_primary").notNull().default(false),
    verifiedAt: timestamp("verified_at", { withTimezone: true }).notNull(),
    removedAt: timestamp("removed_at", { withTimezone: true }),
    ...dates(),
  },
  (t) => [
    uniqueIndex("wallet_address_chain").on(t.address, t.chainId),
    uniqueIndex("one_primary_wallet")
      .on(t.userId)
      .where(sql`${t.isPrimary} = true AND ${t.removedAt} IS NULL`),
    index("wallet_user").on(t.userId),
    check("wallet_lowercase", sql`${t.address} = lower(${t.address})`),
  ],
);
export const walletNonces = pgTable(
  "wallet_verification_nonces",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    walletAddress: text("wallet_address").notNull(),
    nonce: text().notNull().unique(),
    message: text().notNull(),
    domain: text().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("nonce_user_expiry").on(t.userId, t.expiresAt)],
);
export const paymentRequests = pgTable(
  "payment_requests",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    receiverWalletId: uuid("receiver_wallet_id")
      .notNull()
      .references(() => wallets.id),
    title: text().notNull(),
    description: text().notNull().default(""),
    amount: numeric({ precision: 36, scale: 18 }).notNull(),
    asset: text().notNull().default("ETH"),
    chainId: integer("chain_id").notNull(),
    status: requestStatus().notNull().default("active"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    ...dates(),
  },
  (t) => [
    index("request_user_status").on(t.userId, t.status),
    check("request_positive_amount", sql`${t.amount} > 0`),
  ],
);
// Intents bind an immutable server-side expectation before the wallet broadcasts.
export const paymentIntents = pgTable("payment_intents", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  paymentRequestId: uuid("payment_request_id").references(
    () => paymentRequests.id,
  ),
  paymentId: text("payment_id").notNull().unique(),
  contractAddress: text("contract_address"),
  contractVersion: integer("contract_version"),
  tokenHash: text("token_hash").notNull(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  amount: numeric({ precision: 36, scale: 18 }).notNull(),
  title: text().notNull().default(""),
  note: text().notNull().default(""),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const transactions = pgTable(
  "transactions",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id),
    intentId: uuid("intent_id")
      .notNull()
      .unique()
      .references(() => paymentIntents.id),
    paymentRequestId: uuid("payment_request_id").references(
      () => paymentRequests.id,
    ),
    txHash: text("tx_hash").notNull(),
    paymentId: text("payment_id").notNull(),
    contractAddress: text("contract_address"),
    contractVersion: integer("contract_version"),
    chainId: integer("chain_id").notNull(),
    fromAddress: text("from_address").notNull(),
    toAddress: text("to_address").notNull(),
    amount: numeric({ precision: 36, scale: 18 }).notNull(),
    asset: text().notNull().default("ETH"),
    status: transactionStatus().notNull().default("pending"),
    blockNumber: bigint("block_number", { mode: "bigint" }),
    gasUsed: text("gas_used"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    ...dates(),
  },
  (t) => [
    uniqueIndex("tx_hash_chain").on(t.txHash, t.chainId),
    index("tx_user").on(t.userId),
    index("tx_receiver").on(t.toAddress),
    index("tx_sender").on(t.fromAddress),
    uniqueIndex("one_settled_request")
      .on(t.paymentRequestId)
      .where(sql`${t.status} = 'confirmed'`),
  ],
);
export const transactionMetadata = pgTable("transaction_metadata", {
  transactionId: uuid("transaction_id")
    .primaryKey()
    .references(() => transactions.id),
  title: text().notNull().default(""),
  note: text().notNull().default(""),
  category: text(),
});
export const contacts = pgTable(
  "contacts",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    name: text().notNull(),
    walletAddress: text("wallet_address").notNull(),
    chainId: integer("chain_id").notNull(),
    label: text().notNull().default(""),
    ...dates(),
  },
  (t) => [
    index("contact_user").on(t.userId),
    uniqueIndex("contact_user_address").on(
      t.userId,
      t.walletAddress,
      t.chainId,
    ),
  ],
);
export const auditLogs = pgTable("audit_logs", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  action: text().notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  metadata: jsonb().$type<Record<string, string>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const rateLimits = pgTable("rate_limits", {
  key: text().primaryKey(),
  count: integer().notNull(),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});

export const escrowStatus = pgEnum("escrow_status", [
  "created",
  "funded",
  "disputed",
  "refunded",
  "released",
]);

export const milestoneStatus = pgEnum("milestone_status", [
  "pending",
  "submitted",
  "approved",
  "released",
]);

export const escrows = pgTable("escrows", {
  id: uuid().primaryKey().defaultRandom(),
  onChainId: text("on_chain_id").unique(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => users.id),
  freelancerAddress: text("freelancer_address").notNull(),
  freelancerId: uuid("freelancer_id").references(() => users.id),
  contractAddress: text("contract_address"),
  title: text().notNull(),
  description: text().notNull().default(""),
  totalAmount: numeric({ precision: 36, scale: 18 }).notNull(),
  asset: text().notNull().default("ETH"),
  status: escrowStatus().notNull().default("created"),
  ...dates(),
});

export const escrowMilestones = pgTable("escrow_milestones", {
  id: uuid().primaryKey().defaultRandom(),
  escrowId: uuid("escrow_id")
    .notNull()
    .references(() => escrows.id),
  milestoneIndex: integer("milestone_index").notNull(),
  title: text().notNull(),
  description: text().notNull().default(""),
  amount: numeric({ precision: 36, scale: 18 }).notNull(),
  status: milestoneStatus().notNull().default("pending"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  releasedAt: timestamp("released_at", { withTimezone: true }),
  ...dates(),
});

export const escrowTransactionsType = pgEnum("escrow_transactions_type", [
  "deposit",
  "release",
  "refund",
  "dispute_resolved",
]);

export const escrowTransactions = pgTable("escrow_transactions", {
  id: uuid().primaryKey().defaultRandom(),
  escrowId: uuid("escrow_id")
    .notNull()
    .references(() => escrows.id),
  milestoneId: uuid("milestone_id").references(() => escrowMilestones.id),
  txHash: text("tx_hash").notNull(),
  type: escrowTransactionsType("type").notNull(),
  amount: numeric({ precision: 36, scale: 18 }).notNull(),
  status: transactionStatus().notNull().default("pending"),
  blockNumber: bigint("block_number", { mode: "bigint" }),
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  ...dates(),
});

export const escrowSubmissions = pgTable('escrow_submissions', {
  id: uuid().primaryKey().defaultRandom(),
  milestoneId: uuid('milestone_id')
    .notNull()
    .references(() => escrowMilestones.id),
  title: text().notNull(),
  description: text().notNull(),
  evidenceUrl: text('evidence_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
