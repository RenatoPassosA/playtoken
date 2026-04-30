import { writeFile } from "node:fs/promises";
import { CHECKPOINT_FILE } from "./paths.js";
import { readJsonFile } from "./utils.js";
import type { Checkpoint } from "./types.js";

export async function loadCheckpoint(
  contractAddress: string,
  finalityMargin: number,
): Promise<Checkpoint> {
  return readJsonFile<Checkpoint>(CHECKPOINT_FILE, {
    contractAddress,
    lastProcessedBlock: -1,
    lastProcessedBlockHash: null,
    updatedAt: new Date().toISOString(),
    totalIndexedEvents: 0,
    finalityMargin,
  });
}

export async function saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
  await writeFile(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
}

export function validateCheckpoint(
  checkpoint: Checkpoint,
  contractAddress: string,
): void {
  if (
    checkpoint.contractAddress &&
    checkpoint.contractAddress.toLowerCase() !== contractAddress.toLowerCase()
  ) {
    throw new Error(
      [
        "O checkpoint atual pertence a outro endereço de contrato.",
        `Checkpoint: ${checkpoint.contractAddress}`,
        `Atual:      ${contractAddress}`,
        "",
        "Isso normalmente significa que você mudou PLAYTOKEN_ADDRESS,",
        "mas ainda está usando arquivos antigos em indexer/output/.",
        "",
        "Solução segura para ambiente local:",
        "apague indexer/output/ e rode o indexador novamente.",
      ].join("\n"),
    );
  }
}