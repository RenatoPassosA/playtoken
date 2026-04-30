import { readRuntimeConfig, requireContractAddress } from "./core/env.js";
import { runIndexerCycle } from "./core/cycle.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const config = readRuntimeConfig();
  const contractAddress = requireContractAddress(config);

  console.log("== PlayToken watch mode ==");
  console.log("contract:", contractAddress);
  console.log("pollIntervalMs:", config.pollIntervalMs);
  console.log("finalityMargin:", config.finalityMargin);
  console.log("tokenDecimals:", config.tokenDecimals);

  while (true) {
    try {
      const result = await runIndexerCycle({
        contractAddress,
        tokenDecimals: config.tokenDecimals,
        finalityMargin: config.finalityMargin,
      });

      console.log("\n== Watch cycle ==");
      console.log("time:", new Date().toISOString());
      console.log("contract:", contractAddress);
      console.log("status:", result.status);
      console.log("message:", result.message);
      console.log("fromBlock:", result.fromBlock);
      console.log("latestBlock:", result.latestBlock);
      console.log("safeToBlock:", result.safeToBlock);
      console.log("processed:", result.processed);
      console.log("newEvents:", result.newEvents.length);
      console.log("totalEvents:", result.allEvents.length);
    } catch (error) {
      console.error("\n== Watch cycle error ==");
      console.error("time:", new Date().toISOString());
      console.error("message: O ciclo do watch falhou, mas o serviço continuará tentando.");
      console.error(error);
    }

    await sleep(config.pollIntervalMs);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});