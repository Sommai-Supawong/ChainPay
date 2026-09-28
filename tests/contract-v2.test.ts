import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import solc from "solc";
import { Common, Hardfork, Mainnet } from "@ethereumjs/common";
import { createLegacyTx } from "@ethereumjs/tx";
import {
  createAccount,
  createAddressFromPrivateKey,
  createAddressFromString,
  hexToBytes,
  bytesToHex,
  type Address,
} from "@ethereumjs/util";
import { createVM, runTx, type VM } from "@ethereumjs/vm";
import {
  encodeFunctionData,
  decodeFunctionResult,
  parseEther,
  decodeEventLog,
  type Hex,
} from "viem";
import { chainPayV2Abi } from "@/lib/blockchain/chainpay-v2-abi";
const common = new Common({ chain: Mainnet, hardfork: Hardfork.Cancun });
const key = hexToBytes(`0x${"22".repeat(32)}`),
  payer = createAddressFromPrivateKey(key);
const merchant = createAddressFromString(
  "0x3333333333333333333333333333333333333333",
);
const paymentId = `0x${"ab".repeat(32)}` as const;
let vm: VM, address: Address, bytecode: string, maliciousCode: string;
beforeAll(() => {
  const input = {
    language: "Solidity",
    sources: {
      "ChainPayV2.sol": {
        content: readFileSync("contracts/ChainPayV2.sol", "utf8"),
      },
      "Reentrant.sol": {
        content:
          "pragma solidity ^0.8.24; interface Pay { function pay(bytes32 id, address payable m) external payable; } contract Reentrant { receive() external payable { Pay(msg.sender).pay{value:1}(bytes32(uint256(2)), payable(address(0x999))); } }",
      },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
      outputSelection: {
        "*": { "*": ["evm.bytecode.object", "evm.deployedBytecode.object"] },
      },
    },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input))) as {
    errors?: { severity: string; formattedMessage: string }[];
    contracts: Record<
      string,
      Record<
        string,
        {
          evm: {
            bytecode: { object: string };
            deployedBytecode: { object: string };
          };
        }
      >
    >;
  };
  expect(output.errors?.filter((e) => e.severity === "error") ?? []).toEqual(
    [],
  );
  bytecode = output.contracts["ChainPayV2.sol"].ChainPayV2.evm.bytecode.object;
  maliciousCode =
    output.contracts["Reentrant.sol"].Reentrant.evm.deployedBytecode.object;
});
beforeEach(async () => {
  vm = await createVM({ common });
  await vm.stateManager.putAccount(
    payer,
    createAccount({ balance: parseEther("10") }),
  );
  const deploy = createLegacyTx(
    {
      gasLimit: BigInt(3_000_000),
      gasPrice: BigInt(1_000_000_000),
      data: hexToBytes(`0x${bytecode}`),
    },
    { common },
  ).sign(key);
  const result = await runTx(vm, { tx: deploy });
  expect(result.execResult.exceptionError).toBeUndefined();
  address = result.createdAddress!;
});
async function pay(
  value = parseEther("0.1"),
  receiver = merchant.toString() as Hex,
  id = paymentId,
) {
  const nonce = (await vm.stateManager.getAccount(payer))!.nonce;
  const tx = createLegacyTx(
    {
      to: address,
      nonce,
      gasLimit: BigInt(500_000),
      gasPrice: BigInt(1_000_000_000),
      value,
      data: hexToBytes(
        encodeFunctionData({
          abi: chainPayV2Abi,
          functionName: "pay",
          args: [id, receiver],
        }),
      ),
    },
    { common },
  ).sign(key);
  return runTx(vm, { tx });
}
describe("ChainPay V2 contract in an isolated EVM", () => {
  it("forwards ETH, retains no funds, and emits the authoritative payment event", async () => {
    const result = await pay();
    expect(result.execResult.exceptionError).toBeUndefined();
    expect((await vm.stateManager.getAccount(merchant))?.balance).toBe(
      parseEther("0.1"),
    );
    expect((await vm.stateManager.getAccount(address))?.balance).toBe(
      BigInt(0),
    );
    const log = result.execResult.logs![0];
    const event = decodeEventLog({
      abi: chainPayV2Abi,
      eventName: "PaymentCompleted",
      topics: log[1].map(bytesToHex) as [Hex, ...Hex[]],
      data: bytesToHex(log[2]),
    });
    expect(event.args.paymentId).toBe(paymentId);
    expect(event.args.payer.toLowerCase()).toBe(payer.toString());
    expect(event.args.merchant.toLowerCase()).toBe(merchant.toString());
    expect(event.args.amount).toBe(parseEther("0.1"));
    // The isolated VM's default block timestamp is zero.
    expect(event.args.timestamp).toBe(BigInt(0));
  });
  it("reports protocol version 2", async () => {
    const nonce = (await vm.stateManager.getAccount(payer))!.nonce;
    const tx = createLegacyTx(
      {
        to: address,
        nonce,
        gasLimit: BigInt(100_000),
        gasPrice: BigInt(1_000_000_000),
        data: hexToBytes(
          encodeFunctionData({ abi: chainPayV2Abi, functionName: "version" }),
        ),
      },
      { common },
    ).sign(key);
    const result = await runTx(vm, { tx });
    expect(result.execResult.exceptionError).toBeUndefined();
    expect(
      decodeFunctionResult({
        abi: chainPayV2Abi,
        functionName: "version",
        data: bytesToHex(result.execResult.returnValue),
      }),
    ).toBe(BigInt(2));
  });
  it("rejects replay without transferring twice", async () => {
    await pay();
    const result = await pay();
    expect(result.execResult.exceptionError).toBeDefined();
    expect((await vm.stateManager.getAccount(merchant))?.balance).toBe(
      parseEther("0.1"),
    );
  });
  it("rejects zero amount, zero recipient and self-payments", async () => {
    expect((await pay(BigInt(0))).execResult.exceptionError).toBeDefined();
    expect(
      (await pay(BigInt(1), `0x${"0".repeat(40)}`)).execResult.exceptionError,
    ).toBeDefined();
    expect(
      (await pay(BigInt(1), payer.toString() as Hex)).execResult.exceptionError,
    ).toBeDefined();
    expect(
      (await pay(BigInt(1), address.toString() as Hex)).execResult
        .exceptionError,
    ).toBeDefined();
    expect(
      (await pay(BigInt(1), merchant.toString() as Hex, `0x${"0".repeat(64)}`))
        .execResult.exceptionError,
    ).toBeDefined();
  });
  it("rolls back a failed forwarding call and allows a later retry", async () => {
    await vm.stateManager.putCode(merchant, hexToBytes("0x60006000fd"));
    expect((await pay()).execResult.exceptionError).toBeDefined();
    expect((await vm.stateManager.getAccount(address))?.balance).toBe(
      BigInt(0),
    );
    await vm.stateManager.putCode(merchant, new Uint8Array());
    expect((await pay()).execResult.exceptionError).toBeUndefined();
  });
  it("blocks reentrancy and leaves no trapped payment", async () => {
    await vm.stateManager.putCode(merchant, hexToBytes(`0x${maliciousCode}`));
    expect((await pay()).execResult.exceptionError).toBeDefined();
    expect((await vm.stateManager.getAccount(address))?.balance).toBe(
      BigInt(0),
    );
    expect((await vm.stateManager.getAccount(merchant))?.balance).toBe(
      BigInt(0),
    );
  });
});
