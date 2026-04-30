import { Inject, Injectable } from "@nestjs/common";
import {
  INDEXER_READ_REPOSITORY,
  type IndexerReadRepository,
} from "../../domain/repositories/indexer-read.repository";

@Injectable()
export class ListAddressesUseCase {
  constructor(
    @Inject(INDEXER_READ_REPOSITORY)
    private readonly repository: IndexerReadRepository,
  ) {}

  async execute() {
    const addresses = await this.repository.listAddresses();

    return {
      total: addresses.length,
      addresses,
    };
  }
}