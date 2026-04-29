import { readFile } from "node:fs/promises";
import type { IndexedEvent, QueryEventLike } from "./types.js";

export async function readJsonFile<T>(path: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(path, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

export function getTransactionIndex(event: QueryEventLike): number {
  return Number(event.transactionIndex ?? event.log?.transactionIndex ?? -1);
}

export function getLogIndex(event: QueryEventLike): number {
  return Number(event.logIndex ?? event.index ?? event.log?.index ?? -1);
}

export function compareEvents(a: IndexedEvent, b: IndexedEvent): number {
  if (a.blockNumber !== b.blockNumber) {
    return a.blockNumber - b.blockNumber;
  }

  if (a.transactionIndex !== b.transactionIndex) {
    return a.transactionIndex - b.transactionIndex;
  }

  return a.logIndex - b.logIndex;
}

export function eventKey(event: IndexedEvent): string {
  return `${event.transactionHash}:${event.logIndex}`;
}