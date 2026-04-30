import { Module } from "@nestjs/common";
import { GetAddressProjectionUseCase } from "../../application/use-cases/get-address-projection.use-case";
import { GetAddressSummaryUseCase } from "../../application/use-cases/get-address-summary.use-case";
import { ListAddressesUseCase } from "../../application/use-cases/list-addresses.use-case";
import { FileSystemModule } from "../../infrastructure/file-system/file-system.module";
import { AddressesController } from "./addresses.controller";

@Module({
  imports: [FileSystemModule],
  controllers: [AddressesController],
  providers: [
    ListAddressesUseCase,
    GetAddressProjectionUseCase,
    GetAddressSummaryUseCase,
  ],
})
export class AddressesModule {}