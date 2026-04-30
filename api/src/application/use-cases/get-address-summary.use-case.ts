import { Injectable } from "@nestjs/common";
import { GetAddressProjectionUseCase } from "./get-address-projection.use-case";

@Injectable()
export class GetAddressSummaryUseCase {
  constructor(
    private readonly getAddressProjectionUseCase: GetAddressProjectionUseCase,
  ) {}

  async execute(address: string) {
    const projection = await this.getAddressProjectionUseCase.execute(address);

    return {
      address: projection.address,
      summary: projection.summary,
    };
  }
}