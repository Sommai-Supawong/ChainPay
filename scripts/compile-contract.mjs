import fs from "node:fs";
import solc from "solc";
const sources = Object.fromEntries(
  ["ChainPay.sol", "ChainPayV2.sol", "ChainPayEscrow.sol"].map((file) => [
    file,
    { content: fs.readFileSync(`contracts/${file}`, "utf8") },
  ]),
);
const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "cancun",
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"],
      },
    },
  },
};
const output = JSON.parse(solc.compile(JSON.stringify(input)));
for (const issue of output.errors ?? []) console.error(issue.formattedMessage);
if (output.errors?.some((issue) => issue.severity === "error")) process.exit(1);
fs.mkdirSync("artifacts", { recursive: true });
for (const [file, name] of [
  ["ChainPay.sol", "ChainPay"],
  ["ChainPayV2.sol", "ChainPayV2"],
  ["ChainPayEscrow.sol", "ChainPayEscrow"],
]) {
  fs.writeFileSync(
    `artifacts/${name}.json`,
    JSON.stringify(
      { compiler: solc.version(), ...output.contracts[file][name] },
      null,
      2,
    ),
  );
  console.log(`Compiled ${file} with ${solc.version()}`);
}
