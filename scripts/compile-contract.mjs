import fs from "node:fs";
import solc from "solc";
const source = fs.readFileSync("contracts/ChainPay.sol", "utf8");
const input = {
  language: "Solidity",
  sources: { "ChainPay.sol": { content: source } },
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
fs.writeFileSync(
  "artifacts/ChainPay.json",
  JSON.stringify(
    { compiler: solc.version(), ...output.contracts["ChainPay.sol"].ChainPay },
    null,
    2,
  ),
);
console.log(`Compiled ChainPay.sol with ${solc.version()}`);
