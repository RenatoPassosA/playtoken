import { Module } from "@nestjs/common";
import { AddressesModule } from "./modules/addresses/addresses.module";
import { EventsModule } from "./modules/events/events.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [HealthModule, EventsModule, AddressesModule],
})
export class AppModule {}