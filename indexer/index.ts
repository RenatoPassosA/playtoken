import { readRuntimeConfig, requireContractAddress } from "./core/env.js";
import { runIndexerCycle } from "./core/cycle.js";

async function main() {
  const config = readRuntimeConfig();
  const contractAddress = requireContractAddress(config);

  const result = await runIndexerCycle({
    contractAddress,
    tokenDecimals: config.tokenDecimals,
    finalityMargin: config.finalityMargin,
  });

  console.log("== Indexer ==");
  console.log("contract:", contractAddress);
  console.log("fromBlock:", result.fromBlock);
  console.log("latestBlock:", result.latestBlock);
  console.log("safeToBlock:", result.safeToBlock);
  console.log("processed:", result.processed);
  console.log("newEvents:", result.newEvents.length);
  console.log("totalEvents:", result.allEvents.length);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});