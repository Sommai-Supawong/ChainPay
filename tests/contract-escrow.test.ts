import { describe, expect, it } from "vitest";
import { Common, Hardfork, Mainnet } from "@ethereumjs/common";
import { createLegacyTx } from "@ethereumjs/tx";
import {
  createAccount,
  createAddressFromPrivateKey,
  hexToBytes,
  bytesToHex,
  type Address,
} from "@ethereumjs/util";
import { createVM, runTx, type VM } from "@ethereumjs/vm";
import { keccak256, toHex, encodeFunctionData, decodeEventLog, parseEther, type Hex } from "viem";
import fs from "node:fs";

const artifact = JSON.parse(
  fs.readFileSync("artifacts/ChainPayEscrow.json", "utf8"),
);

const privateKey = hexToBytes(`0x${"11".repeat(32)}`);
const callerAddress = createAddressFromPrivateKey(privateKey);

const clientPrivateKey = hexToBytes(`0x${"22".repeat(32)}`);
const clientAddress = createAddressFromPrivateKey(clientPrivateKey);

const freelancerPrivateKey = hexToBytes(`0x${"33".repeat(32)}`);
const freelancerAddress = createAddressFromPrivateKey(freelancerPrivateKey);

describe("ChainPayEscrow", async () => {
  const common = new Common({ chain: Mainnet, hardfork: Hardfork.Cancun });
  let vm: VM;
  let contractAddress: Address;
  
  it("deploys", async () => {
    vm = await createVM({ common });
    
    await vm.stateManager.putAccount(
      callerAddress,
      createAccount({ balance: parseEther("10") })
    );
    await vm.stateManager.putAccount(
      clientAddress,
      createAccount({ balance: parseEther("10") })
    );
  
    const deployTx = createLegacyTx(
      {
        nonce: 0,
        gasLimit: BigInt(3000000),
        gasPrice: BigInt(1000000000),
        data: hexToBytes(`0x${artifact.evm.bytecode.object}`),
      },
      { common },
    ).sign(privateKey);
    const result = await runTx(vm, { tx: deployTx });
    expect(result.execResult.exceptionError).toBeUndefined();
    contractAddress = result.createdAddress!;
  });

  it("funds escrow", async () => {
    const escrowId = keccak256(toHex("test-escrow"));
    const data = encodeFunctionData({
      abi: artifact.abi,
      functionName: "fund",
      args: [
        escrowId,
        freelancerAddress.toString(),
        [parseEther("0.1"), parseEther("0.2")],
      ],
    });

    const tx = createLegacyTx(
      {
        to: contractAddress,
        nonce: 0,
        gasLimit: BigInt(300000),
        gasPrice: BigInt(1000000000),
        value: parseEther("0.3"),
        data: hexToBytes(data),
      },
      { common },
    ).sign(clientPrivateKey);

    const result = await runTx(vm, { tx });
    expect(result.execResult.exceptionError).toBeUndefined();
    
    // Check if the EscrowFunded event was emitted
    const log = result.execResult.logs![0];
    const decoded = decodeEventLog({
      abi: artifact.abi,
      eventName: "EscrowFunded",
      data: bytesToHex(log[2]),
      topics: log[1].map(bytesToHex) as [Hex, ...Hex[]],
    });
    expect(decoded.eventName).toBe("EscrowFunded");
  });

  it("releases a milestone", async () => {
    const escrowId = keccak256(toHex("test-escrow"));
    const data = encodeFunctionData({
      abi: artifact.abi,
      functionName: "release",
      args: [escrowId, BigInt(0)],
    });

    const tx = createLegacyTx(
      {
        to: contractAddress,
        nonce: 1, // client nonce
        gasLimit: BigInt(300000),
        gasPrice: BigInt(1000000000),
        data: hexToBytes(data),
      },
      { common },
    ).sign(clientPrivateKey);

    const result = await runTx(vm, { tx });
    expect(result.execResult.exceptionError).toBeUndefined();

    // Check balance of freelancer
    const freelancerAcc = await vm.stateManager.getAccount(freelancerAddress);
    expect(freelancerAcc?.balance).toBe(parseEther("0.1"));
  });
});
