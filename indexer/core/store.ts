import { mkdir, writeFile } from "node:fs/promises";
import { EVENTS_FILE, OUTPUT_DIR } from "./paths.js";
import type { IndexedEvent } from "./types.js";
import { compareEvents, eventKey, readJsonFile } from "./utils.js";

export async function loadStoredEvents(): Promise<IndexedEvent[]> {
  return readJsonFile<IndexedEvent[]>(EVENTS_FILE, []);
}

export async function mergeAndSaveEvents(
  existingEvents: IndexedEvent[],
  newEvents: IndexedEvent[],
): Promise<IndexedEvent[]> {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const merged = new Map<string, IndexedEvent>();

  for (const event of existingEvents) {
    merged.set(eventKey(event), event);
  }

  for (const event of newEvents) {
    merged.set(eventKey(event), event);
  }

  const allEvents = Array.from(merged.values()).sort(compareEvents);

  await writeFile(EVENTS_FILE, JSON.stringify(allEvents, null, 2));

  return allEvents;
}