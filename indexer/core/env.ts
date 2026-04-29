export type RuntimeConfig = {
  contractAddress?: string;
  tokenDecimals: number;
  finalityMargin: number;
  pollIntervalMs: number;
};

export function readRuntimeConfig(): RuntimeConfig {
  return {
    contractAddress: process.env.PLAYTOKEN_ADDRESS,
    tokenDecimals: Number(process.env.TOKEN_DECIMALS ?? "18"),
    finalityMargin: Number(process.env.FINALITY_MARGIN ?? "0"),
    pollIntervalMs: Number(process.env.POLL_INTERVAL_MS ?? "5000"),
  };
}

export function requireContractAddress(config: RuntimeConfig): string {
  if (!config.contractAddress) {
    throw new Error("Defina PLAYTOKEN_ADDRESS antes de rodar o indexador.");
  }

  return config.contractAddress;
}