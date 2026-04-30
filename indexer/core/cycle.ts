import hre from "hardhat";
import {loadCheckpoint, saveCheckpoint, validateCheckpoint,} from "./checkpoint.js";
import { fetchIndexedEvents } from "./events.js";
import { writeAddressProjections } from "./projections.js";
import {loadStoredEvents, mergeAndSaveEvents, resetIndexerOutput,} from "./store.js";
import type { Checkpoint, CycleResult, IndexedEvent } from "./types.js";

export async function runIndexerCycle(env: {
  contractAddress: string;
  tokenDecimals: number;
  finalityMargin: number;
}): Promise<CycleResult> {
  const { ethers } = await hre.network.getOrCreate("localhost");

  const token = await ethers.getContractAt("PlayToken", env.contractAddress);
  const latestBlock = await ethers.provider.getBlockNumber();
  const safeToBlock = Math.max(latestBlock - env.finalityMargin, -1);

  const checkpoint = await loadCheckpoint(
    env.contractAddress,
    env.finalityMargin,
  );

  validateCheckpoint(checkpoint, env.contractAddress);

  if (checkpoint.lastProcessedBlock > latestBlock) {
    await resetIndexerOutput();

    return {
      status: "checkpoint_ahead_recovered",
      message:
        "Checkpoint estava à frente da chain atual. Isso indica provável reset da chain local. Os arquivos derivados foram limpos.",
      fromBlock: null,
      latestBlock,
      safeToBlock,
      newEvents: [] as IndexedEvent[],
      allEvents: [],
      processed: false,
    };
  }

  if (
    checkpoint.lastProcessedBlock >= 0 &&
    checkpoint.lastProcessedBlockHash !== null
  ) {
    const checkpointBlock = await ethers.provider.getBlock(
      checkpoint.lastProcessedBlock,
    );

    if (
      !checkpointBlock ||
      checkpointBlock.hash !== checkpoint.lastProcessedBlockHash
    ) {
      await resetIndexerOutput();

      return {
        status: "chain_reset_recovered",
        message:
          "O hash do último bloco processado mudou. Isso indica reset/reorg da chain. Os arquivos derivados foram limpos.",
        fromBlock: null,
        latestBlock,
        safeToBlock,
        newEvents: [] as IndexedEvent[],
        allEvents: [],
        processed: false,
      };
    }
  }

  const fromBlock = checkpoint.lastProcessedBlock + 1;

  if (fromBlock > safeToBlock) {
    const allEvents = await loadStoredEvents();

    const hasNewUnsafeBlocks = latestBlock > checkpoint.lastProcessedBlock;

    return {
      status: hasNewUnsafeBlocks ? "waiting_finality" : "idle",
      message: hasNewUnsafeBlocks
        ? "Existem blocos novos, mas eles ainda estão dentro da margem de finalidade. Aguardando ficarem seguros."
        : "Nenhum bloco novo seguro encontrado desde o último checkpoint.",
      fromBlock,
      latestBlock,
      safeToBlock,
      newEvents: [] as IndexedEvent[],
      allEvents,
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

  const safeBlock = await ethers.provider.getBlock(safeToBlock);

  const newCheckpoint: Checkpoint = {
    contractAddress: env.contractAddress,
    lastProcessedBlock: safeToBlock,
    lastProcessedBlockHash: safeBlock?.hash ?? null,
    updatedAt: new Date().toISOString(),
    totalIndexedEvents: allEvents.length,
    finalityMargin: env.finalityMargin,
  };

  await saveCheckpoint(newCheckpoint);

  return {
    status: "indexed",
    message:
      newEvents.length > 0
        ? "Blocos processados com sucesso e novos eventos encontrados."
        : "Blocos processados com sucesso, mas nenhum evento novo foi encontrado.",
    fromBlock,
    latestBlock,
    safeToBlock,
    newEvents,
    allEvents,
    processed: true,
  };
}