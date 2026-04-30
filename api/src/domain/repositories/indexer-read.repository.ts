import type { AddressProjection } from "../entities/address-projection.entity";
import type { IndexedEvent } from "../entities/indexed-event.entity";

export const INDEXER_READ_REPOSITORY = Symbol("INDEXER_READ_REPOSITORY");

export interface IndexerReadRepository {
  listEvents(): Promise<IndexedEvent[]>;
  listAddresses(): Promise<string[]>;
  getAddressProjection(address: string): Promise<AddressProjection | null>;
}