import { Injectable } from "@nestjs/common";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { AddressProjection } from "../../domain/entities/address-projection.entity";
import type { IndexedEvent } from "../../domain/entities/indexed-event.entity";
import type { IndexerReadRepository } from "../../domain/repositories/indexer-read.repository";

@Injectable()
export class IndexerFileRepository implements IndexerReadRepository {
  private readonly outputDir: string;
  private readonly eventsFile: string;
  private readonly byAddressDir: string;

  constructor() {
    this.outputDir =
      process.env.INDEXER_OUTPUT_DIR ??
      resolve(process.cwd(), "..", "indexer", "output");

    this.eventsFile = join(this.outputDir, "events.json");
    this.byAddressDir = join(this.outputDir, "by-address");
  }

  async listEvents(): Promise<IndexedEvent[]> {
    return this.readJsonFile<IndexedEvent[]>(this.eventsFile, []);
  }

  async listAddresses(): Promise<string[]> {
    try {
      const files = await readdir(this.byAddressDir);

      return files
        .filter((file) => file.endsWith(".json"))
        .map((file) => file.replace(".json", ""))
        .sort();
    } catch {
      return [];
    }
  }

  async getAddressProjection(
    address: string,
  ): Promise<AddressProjection | null> {
    const normalizedAddress = address.toLowerCase();
    const filePath = join(this.byAddressDir, `${normalizedAddress}.json`);

    return this.readJsonFile<AddressProjection | null>(filePath, null);
  }

  private async readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
    try {
      const fileContent = await readFile(filePath, "utf-8");
      return JSON.parse(fileContent) as T;
    } catch {
      return fallback;
    }
  }
}