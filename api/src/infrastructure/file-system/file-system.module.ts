import { Module } from "@nestjs/common";
import { INDEXER_READ_REPOSITORY } from "../../domain/repositories/indexer-read.repository";
import { IndexerFileRepository } from "./indexer-file.repository";

@Module({
  providers: [
    {
      provide: INDEXER_READ_REPOSITORY,
      useClass: IndexerFileRepository,
    },
  ],
  exports: [INDEXER_READ_REPOSITORY],
})
export class FileSystemModule {}