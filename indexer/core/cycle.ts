import hre from "hardhat";
import { loadCheckpoint, saveCheckpoint, validateCheckpoint } from "./checkpoint.js";
import type { Checkpoint, IndexedEvent } from "./types.js";
import { fetchIndexedEvents } from "./events.js";
import { mergeAndSaveEvents, loadStoredEvents } from "./store.js";
import { writeAddressProjections } from "./projections.js";

export async function runIndexerCycle(env: {
  contractAddress: string;
  tokenDecimals: number;
  finalityMargin: number;
}) {
  const { ethers } = await hre.network.connect("localhost");

  const token = await ethers.getContractAt("PlayToken", env.contractAddress);
  const latestBlock = await ethers.provider.getBlockNumber();
  const safeToBlock = Math.max(latestBlock - env.finalityMargin, -1);

  const checkpoint = await loadCheckpoint(
    env.contractAddress,
    env.finalityMargin,
  );

  validateCheckpoint(checkpoint, env.contractAddress);

  const fromBlock = checkpoint.lastProcessedBlock + 1;

  if (fromBlock > safeToBlock) {
    return {
      fromBlock,
      latestBlock,
      safeToBlock,
      newEvents: [] as IndexedEvent[],
      allEvents: await loadStoredEvents(),
      processed: false,
    };
  }

  const newEvents = await fetchIndexedEvents(
    token,
    fromBlock,
    safeToBlock,
    env.tokenDecimals,
  );

  const existingEvents = await loadStoredEvents();
  const allEvents = await mergeAndSaveEvents(existingEvents, newEvents);

  await writeAddressProjections(allEvents, env.tokenDecimals);

  const newCheckpoint: Checkpoint = {
    contractAddress: env.contractAddress,
    lastProcessedBlock: safeToBlock,
    updatedAt: new Date().toISOString(),
    totalIndexedEvents: allEvents.length,
    finalityMargin: env.finalityMargin,
  };

  await saveCheckpoint(newCheckpoint);

  return {
    fromBlock,
    latestBlock,
    safeToBlock,
    newEvents,
    allEvents,
    processed: true,
  };
}