import { Module } from "@nestjs/common";
import { ListEventsUseCase } from "../../application/use-cases/list-events.use-case";
import { FileSystemModule } from "../../infrastructure/file-system/file-system.module";
import { EventsController } from "./events.controller";

@Module({
  imports: [FileSystemModule],
  controllers: [EventsController],
  providers: [ListEventsUseCase],
})
export class EventsModule {}