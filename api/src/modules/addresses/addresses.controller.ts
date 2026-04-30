import { Controller, Get, Param } from "@nestjs/common";
import { GetAddressProjectionUseCase } from "../../application/use-cases/get-address-projection.use-case";
import { GetAddressSummaryUseCase } from "../../application/use-cases/get-address-summary.use-case";
import { ListAddressesUseCase } from "../../application/use-cases/list-addresses.use-case";

@Controller("addresses")
export class AddressesController {
  constructor(
    private readonly listAddressesUseCase: ListAddressesUseCase,
    private readonly getAddressProjectionUseCase: GetAddressProjectionUseCase,
    private readonly getAddressSummaryUseCase: GetAddressSummaryUseCase,
  ) {}

  @Get()
  async listAddresses() {
    return this.listAddressesUseCase.execute();
  }

  @Get(":address")
  async getAddressProjection(@Param("address") address: string) {
    return this.getAddressProjectionUseCase.execute(address);
  }

  @Get(":address/summary")
  async getAddressSummary(@Param("address") address: string) {
    return this.getAddressSummaryUseCase.execute(address);
  }

  @Get(":address/transfers")
  async getAddressTransfers(@Param("address") address: string) {
    const projection = await this.getAddressProjectionUseCase.execute(address);

    return {
      address: projection.address,
      sent: {
        total: projection.transfersSent.length,
        events: projection.transfersSent,
      },
      received: {
        total: projection.transfersReceived.length,
        events: projection.transfersReceived,
      },
    };
  }

  @Get(":address/approvals")
  async getAddressApprovals(@Param("address") address: string) {
    const projection = await this.getAddressProjectionUseCase.execute(address);

    return {
      address: projection.address,
      asOwner: {
        total: projection.approvalsAsOwner.length,
        events: projection.approvalsAsOwner,
      },
      asSpender: {
        total: projection.approvalsAsSpender.length,
        events: projection.approvalsAsSpender,
      },
    };
  }
}