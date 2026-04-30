import { Inject, Injectable } from "@nestjs/common";
import {
  INDEXER_READ_REPOSITORY,
  type IndexerReadRepository,
} from "../../domain/repositories/indexer-read.repository";

@Injectable()
export class ListEventsUseCase {
  constructor(
    @Inject(INDEXER_READ_REPOSITORY)
    private readonly repository: IndexerReadRepository,
  ) {}

  async execute() {
    const events = await this.repository.listEvents();

    return {
      total: events.length,
      events,
    };
  }
}