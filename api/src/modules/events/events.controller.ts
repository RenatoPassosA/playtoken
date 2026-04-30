import { Controller, Get } from "@nestjs/common";
import { ListEventsUseCase } from "../../application/use-cases/list-events.use-case";

@Controller("events")
export class EventsController {
  constructor(private readonly listEventsUseCase: ListEventsUseCase) {}

  @Get()
  async listEvents() {
    return this.listEventsUseCase.execute();
  }
}