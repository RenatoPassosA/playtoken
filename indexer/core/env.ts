import { getAddress, isAddress } from "ethers";

export type RuntimeConfig = {
  contractAddress: string | undefined;
  tokenDecimals: number;
  finalityMargin: number;
  pollIntervalMs: number;
};

function readOptionalString(name: string): string | undefined {
  const value = process.env[name];

  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return undefined;
  }

  return trimmedValue;
}

function readIntegerEnv(
  name: string,
  defaultValue: number,
  options?: {
    min?: number;
    max?: number;
  },
): number {
  const rawValue = readOptionalString(name);

  if (rawValue === undefined) {
    return defaultValue;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue)) {
    throw new Error(
      [
        `Variável de ambiente inválida: ${name}`,
        `Valor recebido: ${rawValue}`,
        "",
        "O valor precisa ser um número inteiro.",
        `Exemplo: ${name}=${defaultValue}`,
      ].join("\n"),
    );
  }

  if (options?.min !== undefined && parsedValue < options.min) {
    throw new Error(
      [
        `Variável de ambiente inválida: ${name}`,
        `Valor recebido: ${rawValue}`,
        "",
        `O valor precisa ser maior ou igual a ${options.min}.`,
      ].join("\n"),
    );
  }

  if (options?.max !== undefined && parsedValue > options.max) {
    throw new Error(
      [
        `Variável de ambiente inválida: ${name}`,
        `Valor recebido: ${rawValue}`,
        "",
        `O valor precisa ser menor ou igual a ${options.max}.`,
      ].join("\n"),
    );
  }

  return parsedValue;
}

export function readRuntimeConfig(): RuntimeConfig {
  return {
    contractAddress: readOptionalString("PLAYTOKEN_ADDRESS"),
    tokenDecimals: readIntegerEnv("TOKEN_DECIMALS", 18, {
      min: 0,
      max: 255,
    }),
    finalityMargin: readIntegerEnv("FINALITY_MARGIN", 0, {
      min: 0,
    }),
    pollIntervalMs: readIntegerEnv("POLL_INTERVAL_MS", 5000, {
      min: 1,
    }),
  };
}

export function requireContractAddress(config: RuntimeConfig): string {
  if (config.contractAddress === undefined) {
    throw new Error(
      [
        "PLAYTOKEN_ADDRESS não foi informado.",
        "",
        "Defina a variável de ambiente com o endereço do contrato PlayToken.",
        "",
        "Exemplo:",
        "PLAYTOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3 npx hardhat run indexer/watch.ts --network localhost",
      ].join("\n"),
    );
  }

  if (!isAddress(config.contractAddress)) {
    throw new Error(
      [
        `PLAYTOKEN_ADDRESS inválido: ${config.contractAddress}`,
        "",
        "Informe um endereço Ethereum válido.",
        "",
        "Um endereço válido possui:",
        "- prefixo 0x",
        "- 40 caracteres hexadecimais depois do 0x",
        "",
        "Exemplo:",
        "PLAYTOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3",
      ].join("\n"),
    );
  }

  return getAddress(config.contractAddress);
}