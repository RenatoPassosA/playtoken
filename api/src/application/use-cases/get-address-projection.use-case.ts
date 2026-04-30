import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  INDEXER_READ_REPOSITORY,
  type IndexerReadRepository,
} from "../../domain/repositories/indexer-read.repository";

@Injectable()
export class GetAddressProjectionUseCase {
  constructor(
    @Inject(INDEXER_READ_REPOSITORY)
    private readonly repository: IndexerReadRepository,
  ) {}

  async execute(address: string) {
    this.validateAddress(address);

    const projection = await this.repository.getAddressProjection(address);

    if (!projection) {
      throw new NotFoundException(
        `Nenhuma projeção encontrada para o endereço ${address}.`,
      );
    }

    return projection;
  }

  private validateAddress(address: string): void {
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);

    if (!isValidAddress) {
      throw new BadRequestException(
        `Endereço Ethereum inválido: ${address}`,
      );
    }
  }
}