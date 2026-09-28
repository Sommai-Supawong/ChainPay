import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { eq } from "drizzle-orm";
import { privateKeyToAccount } from "viem/accounts";
import {
  encodeFunctionData,
  encodeEventTopics,
  encodeAbiParameters,
  parseEther,
  TransactionNotFoundError,
} from "viem";
import * as schema from "@/db/schema";
import { chain, chainPayAbi } from "@/lib/blockchain/config";

const fixture = vi.hoisted(() => ({
  db: undefined as unknown,
  rpc: {
    getChainId: vi.fn(),
    getTransaction: vi.fn(),
    getTransactionReceipt: vi.fn(),
    getBlockNumber: vi.fn(),
    getBlock: vi.fn(),
  },
}));
vi.mock("@/lib/db/client", () => ({
  withDb: (fn: (db: unknown) => unknown) => fn(fixture.db),
}));
vi.mock("@/lib/blockchain/server", () => ({ ethereum: () => fixture.rpc }));
import {
  challenge,
  verifyWallet,
  changeWallet,
} from "@/features/wallet/server";
import {
  createRequest,
  getRequest,
  changeRequest,
  publicRequest,
} from "@/features/payment-request/server";
import {
  listContacts,
  saveContact,
  removeContact,
} from "@/features/contact/server";
import {
  createIntent,
  submitTransaction,
  verifyTransaction,
  receiptData,
  listTransactions,
} from "@/features/payment/server";

const pg = new PGlite();
const db = drizzle(pg, { schema });
const alice = "00000000-0000-4000-8000-000000000001",
  bob = "00000000-0000-4000-8000-000000000002";
// Public, deterministic test-only keys. Never funded outside the local test VM.
const account = privateKeyToAccount(`0x${"11".repeat(32)}`);
const receiver = "0x2222222222222222222222222222222222222222";
const contract = "0x3333333333333333333333333333333333333333";
const hash = `0x${"aa".repeat(32)}` as const;
let walletId: string;
beforeAll(async () => {
  for (const file of readdirSync("db/migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await pg.exec(readFileSync(`db/migrations/${file}`, "utf8"));
  fixture.db = db;
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  vi.stubEnv("NEXT_PUBLIC_CHAINPAY_CONTRACT_ADDRESS", contract);
  vi.stubEnv("NEXT_PUBLIC_CHAINPAY_CONTRACT_VERSION", "2");
  vi.stubEnv(
    "CHAINPAY_V1_CONTRACT_ADDRESS",
    "0x4444444444444444444444444444444444444444",
  );
}, 30_000);
afterAll(async () => {
  await pg.close();
  vi.unstubAllEnvs();
});
beforeEach(async () => {
  await pg.exec(
    "TRUNCATE users, wallets, wallet_verification_nonces, payment_requests, payment_intents, transactions, transaction_metadata, contacts, audit_logs, rate_limits CASCADE",
  );
  await db.insert(schema.users).values([
    { id: alice, firebaseUid: "alice", email: "alice@example.test" },
    { id: bob, firebaseUid: "bob", email: "bob@example.test" },
  ]);
  const [wallet] = await db
    .insert(schema.wallets)
    .values({
      userId: alice,
      address: receiver,
      chainId: chain.id,
      verifiedAt: new Date(),
      isPrimary: true,
    })
    .returning();
  walletId = wallet.id;
  fixture.rpc.getChainId.mockResolvedValue(chain.id);
});
const requestInput = () => ({
  title: "Design",
  description: "Public context",
  amount: "0.1",
  receiverWalletId: walletId,
  expiresIn: "week" as const,
  status: "active" as const,
});
describe("database-backed ownership boundaries", () => {
  it("isolates contacts and rejects another user's edits/deletes", async () => {
    const contact = await saveContact(alice, {
      name: "Client",
      walletAddress: receiver,
      label: "",
    });
    expect(await listContacts(bob)).toEqual([]);
    await expect(
      saveContact(
        bob,
        { name: "Stolen", walletAddress: receiver, label: "" },
        contact.id,
      ),
    ).rejects.toMatchObject({ status: 404 });
    await expect(removeContact(bob, contact.id)).rejects.toMatchObject({
      status: 404,
    });
    expect((await listContacts(alice))[0].name).toBe("Client");
  });
  it("rejects a foreign wallet when creating requests", async () => {
    await expect(createRequest(bob, requestInput())).rejects.toMatchObject({
      status: 400,
    });
  });
  it("keeps private request operations owner-scoped and exposes a limited public projection", async () => {
    const r = await createRequest(alice, requestInput());
    await expect(getRequest(r.id, bob)).rejects.toMatchObject({ status: 404 });
    await expect(changeRequest(bob, r.id, "cancelled")).rejects.toMatchObject({
      status: 404,
    });
    const publicData = await publicRequest(r.slug);
    expect(publicData).not.toHaveProperty("userId");
    expect(publicData).not.toHaveProperty("email");
    expect(publicData.amount).toBe("0.100000000000000000");
  });
  it("prevents wallet removal while a request is open", async () => {
    await createRequest(alice, requestInput());
    await expect(changeWallet(alice, walletId, true)).rejects.toMatchObject({
      status: 409,
    });
  });
  it("allows one primary wallet per owner at the database layer", async () => {
    await expect(
      db.insert(schema.wallets).values({
        userId: alice,
        address: account.address.toLowerCase(),
        chainId: chain.id,
        isPrimary: true,
        verifiedAt: new Date(),
      }),
    ).rejects.toThrow();
  });
});
describe("wallet signature identity", () => {
  it("verifies a real signature, consumes the nonce, and rejects replay", async () => {
    const c = await challenge(alice, account.address.toLowerCase());
    const signature = await account.signMessage({ message: c.message });
    const wallet = await verifyWallet(alice, c.id, signature);
    expect(wallet.userId).toBe(alice);
    expect(wallet.isPrimary).toBe(false);
    await expect(verifyWallet(alice, c.id, signature)).rejects.toMatchObject({
      status: 400,
    });
  });
  it("rejects another user, wrong signature, expired nonce and changed domain", async () => {
    const c = await challenge(alice, account.address.toLowerCase());
    const signature = await account.signMessage({ message: c.message });
    await expect(verifyWallet(bob, c.id, signature)).rejects.toMatchObject({
      status: 400,
    });
    const wrong = await account.signMessage({ message: "different message" });
    await expect(verifyWallet(alice, c.id, wrong)).rejects.toMatchObject({
      status: 400,
    });
    await db
      .update(schema.walletNonces)
      .set({ expiresAt: new Date(0) })
      .where(eq(schema.walletNonces.id, c.id));
    await expect(verifyWallet(alice, c.id, signature)).rejects.toMatchObject({
      status: 400,
    });
    await db
      .update(schema.walletNonces)
      .set({ expiresAt: new Date(Date.now() + 60000), domain: "evil.test" })
      .where(eq(schema.walletNonces.id, c.id));
    await expect(verifyWallet(alice, c.id, signature)).rejects.toMatchObject({
      status: 400,
    });
  });
  it("does not let a second account claim an existing linked wallet", async () => {
    const c = await challenge(alice, account.address.toLowerCase());
    await verifyWallet(
      alice,
      c.id,
      await account.signMessage({ message: c.message }),
    );
    const other = await challenge(bob, account.address.toLowerCase());
    await expect(
      verifyWallet(
        bob,
        other.id,
        await account.signMessage({ message: other.message }),
      ),
    ).rejects.toMatchObject({ status: 409 });
  });
});
async function submitted() {
  const r = await createRequest(alice, requestInput());
  const intent = await createIntent(null, {
    slug: r.slug,
    fromAddress: account.address.toLowerCase() as `0x${string}`,
    toAddress: receiver,
    amount: "0.1",
    title: "tampered",
    note: "not public",
  });
  fixture.rpc.getTransaction.mockResolvedValue({
    from: account.address.toLowerCase(),
    to: contract,
    chainId: chain.id,
    value: parseEther("0.1"),
    input: encodeFunctionData({
      abi: chainPayAbi,
      functionName: "pay",
      args: [intent.paymentId, receiver],
    }),
  });
  const input = { intentId: intent.id, token: intent.token, hash };
  await submitTransaction(input);
  return { r, intent, input };
}
describe("payment persistence and independent confirmation", () => {
  it("blocks a new payment intent before broadcast when the server RPC is on Mainnet", async () => {
    fixture.rpc.getChainId.mockResolvedValueOnce(1);
    await expect(
      createIntent(alice, {
        fromAddress: account.address.toLowerCase() as `0x${string}`,
        toAddress: receiver,
        amount: "0.1",
        title: "",
        note: "",
      }),
    ).rejects.toMatchObject({
      status: 503,
      message: expect.stringContaining("Expected Sepolia (11155111)"),
    });
    expect(await db.select().from(schema.paymentIntents)).toHaveLength(0);
  });
  it("reports an unavailable Sepolia RPC without calling transaction lookup", async () => {
    const r = await createRequest(alice, requestInput());
    const intent = await createIntent(null, {
      slug: r.slug,
      fromAddress: account.address.toLowerCase() as `0x${string}`,
      toAddress: receiver,
      amount: "0.1",
      title: "",
      note: "",
    });
    fixture.rpc.getChainId.mockRejectedValueOnce(new Error("network failure"));
    await expect(
      submitTransaction({ intentId: intent.id, token: intent.token, hash }),
    ).rejects.toMatchObject({
      status: 503,
      message: expect.stringContaining("Sepolia RPC is unavailable"),
    });
    expect(fixture.rpc.getTransaction).not.toHaveBeenCalled();
  });
  it("rejects an invalid active V2 contract address before creating an intent", async () => {
    vi.stubEnv("NEXT_PUBLIC_CHAINPAY_CONTRACT_ADDRESS", "0x0");
    await expect(
      createIntent(alice, {
        fromAddress: account.address.toLowerCase() as `0x${string}`,
        toAddress: receiver,
        amount: "0.1",
        title: "",
        note: "",
      }),
    ).rejects.toThrow("Payments are not configured");
    vi.stubEnv("NEXT_PUBLIC_CHAINPAY_CONTRACT_ADDRESS", contract);
  });
  it("rejects a Mainnet RPC before looking up a Sepolia transaction", async () => {
    const r = await createRequest(alice, requestInput());
    const intent = await createIntent(null, {
      slug: r.slug,
      fromAddress: account.address.toLowerCase() as `0x${string}`,
      toAddress: receiver,
      amount: "0.1",
      title: "",
      note: "",
    });
    fixture.rpc.getChainId.mockResolvedValueOnce(1);
    await expect(
      submitTransaction({ intentId: intent.id, token: intent.token, hash }),
    ).rejects.toMatchObject({
      status: 503,
      message: expect.stringContaining("Expected Sepolia (11155111)"),
    });
    expect(fixture.rpc.getTransaction).not.toHaveBeenCalled();
    expect(await db.select().from(schema.transactions)).toHaveLength(0);
  });
  it("rejects a Mainnet RPC before confirming a pending V2 payment", async () => {
    await submitted();
    fixture.rpc.getChainId.mockResolvedValueOnce(1);
    await expect(verifyTransaction(hash)).rejects.toMatchObject({
      status: 503,
      message: expect.stringContaining("Expected Sepolia (11155111)"),
    });
    expect(fixture.rpc.getTransactionReceipt).not.toHaveBeenCalled();
    expect((await db.select().from(schema.transactions))[0].status).toBe(
      "pending",
    );
  });
  it("keeps the original intent and hash retryable until Sepolia indexes the transaction", async () => {
    const r = await createRequest(alice, requestInput());
    const intent = await createIntent(null, {
      slug: r.slug,
      fromAddress: account.address.toLowerCase() as `0x${string}`,
      toAddress: receiver,
      amount: "0.1",
      title: "",
      note: "",
    });
    const submission = { intentId: intent.id, token: intent.token, hash };
    fixture.rpc.getTransaction.mockRejectedValueOnce(
      new TransactionNotFoundError({ hash }),
    );
    await expect(submitTransaction(submission)).rejects.toMatchObject({
      status: 409,
      message: expect.stringContaining("retry saving"),
    });
    expect(await db.select().from(schema.transactions)).toHaveLength(0);
    fixture.rpc.getTransaction.mockResolvedValueOnce({
      from: account.address.toLowerCase(),
      to: contract,
      chainId: chain.id,
      value: parseEther("0.1"),
      input: encodeFunctionData({
        abi: chainPayAbi,
        functionName: "pay",
        args: [intent.paymentId, receiver],
      }),
    });
    expect((await submitTransaction(submission)).status).toBe("pending");
    expect((await submitTransaction(submission)).status).toBe("pending");
    expect((await db.select().from(schema.transactions))[0]).toMatchObject({
      txHash: hash,
      intentId: intent.id,
      contractVersion: 2,
      contractAddress: contract,
    });
    expect(await db.select().from(schema.transactions)).toHaveLength(1);
  });
  it("shows one persisted payment as sent and received for verified wallet owners", async () => {
    await db
      .update(schema.wallets)
      .set({ userId: bob })
      .where(eq(schema.wallets.id, walletId));
    await db.insert(schema.wallets).values({
      userId: alice,
      address: account.address.toLowerCase(),
      chainId: chain.id,
      verifiedAt: new Date(),
    });
    const intent = await createIntent(alice, {
      fromAddress: account.address.toLowerCase() as `0x${string}`,
      toAddress: receiver,
      amount: "0.1",
      title: "Peer payment",
      note: "",
    });
    fixture.rpc.getTransaction.mockResolvedValueOnce({
      from: account.address.toLowerCase(),
      to: contract,
      chainId: chain.id,
      value: parseEther("0.1"),
      input: encodeFunctionData({
        abi: chainPayAbi,
        functionName: "pay",
        args: [intent.paymentId, receiver],
      }),
    });
    await submitTransaction({ intentId: intent.id, token: intent.token, hash });
    expect((await listTransactions(alice))[0]).toMatchObject({
      txHash: hash,
      direction: "sent",
    });
    expect((await listTransactions(bob))[0]).toMatchObject({
      txHash: hash,
      direction: "received",
    });
    expect(await db.select().from(schema.transactions)).toHaveLength(1);
  });
  it("fails closed when the active protocol version is not V2", async () => {
    vi.stubEnv("NEXT_PUBLIC_CHAINPAY_CONTRACT_VERSION", "1");
    await expect(
      createIntent(alice, {
        slug: "",
        fromAddress: receiver as `0x${string}`,
        toAddress: account.address,
        amount: "0.1",
        title: "",
        note: "",
      }),
    ).rejects.toThrow("ChainPay V2 is not configured");
    vi.stubEnv("NEXT_PUBLIC_CHAINPAY_CONTRACT_VERSION", "2");
  });
  it("verifies a migrated V1 intent and transaction using the legacy registry", async () => {
    const r = await createRequest(alice, requestInput());
    const intent = await createIntent(null, {
      slug: r.slug,
      fromAddress: account.address.toLowerCase() as `0x${string}`,
      toAddress: receiver,
      amount: "0.1",
      title: "",
      note: "",
    });
    const legacyAddress = "0x4444444444444444444444444444444444444444";
    await db
      .update(schema.paymentIntents)
      .set({ contractVersion: 1, contractAddress: null })
      .where(eq(schema.paymentIntents.id, intent.id));
    fixture.rpc.getTransaction.mockResolvedValue({
      from: account.address.toLowerCase(),
      to: legacyAddress,
      chainId: chain.id,
      value: parseEther("0.1"),
      input: encodeFunctionData({
        abi: chainPayAbi,
        functionName: "pay",
        args: [intent.paymentId, receiver],
      }),
    });
    await submitTransaction({ intentId: intent.id, token: intent.token, hash });
    const row = (await db.select().from(schema.transactions))[0];
    expect(row).toMatchObject({
      contractVersion: 1,
      contractAddress: legacyAddress,
    });
    const blockHash = `0x${"bb".repeat(32)}`;
    fixture.rpc.getTransactionReceipt.mockResolvedValue({
      status: "success",
      blockNumber: BigInt(50),
      blockHash,
      gasUsed: BigInt(50000),
      logs: [
        {
          address: legacyAddress,
          topics: encodeEventTopics({
            abi: chainPayAbi,
            eventName: "PaymentCompleted",
            args: {
              paymentId: intent.paymentId,
              payer: account.address,
              merchant: receiver,
            },
          }),
          data: encodeAbiParameters(
            [{ type: "uint256" }, { type: "uint256" }],
            [parseEther("0.1"), BigInt(1700000000)],
          ),
        },
      ],
    });
    fixture.rpc.getBlock.mockResolvedValue({
      hash: blockHash,
      timestamp: BigInt(1700000000),
    });
    fixture.rpc.getBlockNumber.mockResolvedValue(BigInt(51));
    expect((await verifyTransaction(hash)).status).toBe("confirmed");
  });
  it("does not let a stale verification reopen an already settled request", async () => {
    const { r } = await submitted();
    fixture.rpc.getTransactionReceipt.mockResolvedValue({
      status: "reverted",
      blockNumber: BigInt(50),
      blockHash: "block",
      gasUsed: BigInt(30000),
      logs: [],
    });
    fixture.rpc.getBlockNumber.mockResolvedValue(BigInt(51));
    fixture.rpc.getBlock.mockImplementationOnce(async () => {
      // Another verifier commits while this RPC request is in flight.
      await db
        .update(schema.transactions)
        .set({ status: "confirmed" })
        .where(eq(schema.transactions.txHash, hash));
      await db
        .update(schema.paymentRequests)
        .set({ status: "paid" })
        .where(eq(schema.paymentRequests.id, r.id));
      return { hash: "block", timestamp: BigInt(1700000000) };
    });
    expect((await verifyTransaction(hash)).status).toBe("confirmed");
    expect((await getRequest(r.id, alice)).status).toBe("paid");
  });
  it("persists pending and idempotently reuses a submitted transaction", async () => {
    const { r, input } = await submitted();
    expect((await getRequest(r.id, alice)).status).toBe("pending");
    await submitTransaction(input);
    expect(await db.select().from(schema.transactions)).toHaveLength(1);
    expect((await db.select().from(schema.transactions))[0]).toMatchObject({
      contractAddress: contract,
      contractVersion: 2,
    });
    expect((await receiptData(hash, null)).status).toBe("pending");
    expect(await receiptData(hash, null)).not.toHaveProperty("userId");
    expect((await receiptData(hash, null)).note).toBeNull();
  });
  it("rejects a stolen/invalid recovery capability", async () => {
    const { input } = await submitted();
    await expect(
      submitTransaction({ ...input, token: "x".repeat(43) }),
    ).rejects.toMatchObject({ status: 403 });
  });
  it("requires two canonical confirmations and the expected event", async () => {
    const { r, intent } = await submitted();
    const blockHash = `0x${"bb".repeat(32)}`;
    fixture.rpc.getTransactionReceipt.mockResolvedValue({
      status: "success",
      blockNumber: BigInt(50),
      blockHash,
      gasUsed: BigInt(50000),
      logs: [
        {
          address: contract,
          topics: encodeEventTopics({
            abi: chainPayAbi,
            eventName: "PaymentCompleted",
            args: {
              paymentId: intent.paymentId,
              payer: account.address,
              merchant: receiver,
            },
          }),
          data: encodeAbiParameters(
            [{ type: "uint256" }, { type: "uint256" }],
            [parseEther("0.1"), BigInt(1700000000)],
          ),
        },
      ],
    });
    fixture.rpc.getBlock.mockResolvedValue({
      hash: blockHash,
      timestamp: BigInt(1700000000),
    });
    fixture.rpc.getBlockNumber.mockResolvedValue(BigInt(50));
    expect((await verifyTransaction(hash)).status).toBe("pending");
    fixture.rpc.getBlockNumber.mockResolvedValue(BigInt(51));
    expect((await verifyTransaction(hash)).status).toBe("confirmed");
    expect((await getRequest(r.id, alice)).status).toBe("paid");
    expect((await verifyTransaction(hash)).status).toBe("confirmed");
    expect(await db.select().from(schema.transactions)).toHaveLength(1);
  });
  it("persists a reverted transaction and reopens its unpaid request", async () => {
    const { r } = await submitted();
    fixture.rpc.getTransactionReceipt.mockResolvedValue({
      status: "reverted",
      blockNumber: BigInt(50),
      blockHash: "block",
      gasUsed: BigInt(30000),
      logs: [],
    });
    fixture.rpc.getBlock.mockResolvedValue({
      hash: "block",
      timestamp: BigInt(1700000000),
    });
    fixture.rpc.getBlockNumber.mockResolvedValue(BigInt(51));
    expect((await verifyTransaction(hash)).status).toBe("failed");
    expect((await getRequest(r.id, alice)).status).toBe("active");
  });
  it("does not discard a broadcast payment when its request was cancelled", async () => {
    const r = await createRequest(alice, requestInput());
    const intent = await createIntent(null, {
      slug: r.slug,
      fromAddress: account.address.toLowerCase() as `0x${string}`,
      toAddress: receiver,
      amount: "0.1",
      title: "",
      note: "",
    });
    await changeRequest(alice, r.id, "cancelled");
    fixture.rpc.getTransaction.mockResolvedValue({
      from: account.address.toLowerCase(),
      to: contract,
      chainId: chain.id,
      value: parseEther("0.1"),
      input: encodeFunctionData({
        abi: chainPayAbi,
        functionName: "pay",
        args: [intent.paymentId, receiver],
      }),
    });
    await submitTransaction({ intentId: intent.id, token: intent.token, hash });
    expect(
      (await db.select().from(schema.transactions))[0].paymentRequestId,
    ).toBeNull();
    expect((await getRequest(r.id, alice)).status).toBe("cancelled");
    expect(await db.select().from(schema.auditLogs)).toHaveLength(1);
  });
});
