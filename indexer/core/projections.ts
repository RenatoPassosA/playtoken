import { mkdir, writeFile } from "node:fs/promises";
import { formatUnits } from "ethers";
import { BY_ADDRESS_DIR } from "./paths.js";
import type { AddressProjection, IndexedEvent } from "./types.js";
import { compareEvents, normalizeAddress } from "./utils.js";

function emptyProjection(address: string): AddressProjection {
  return {
    address,
    summary: {
      transferCountSent: 0,
      transferCountReceived: 0,
      approvalCountAsOwner: 0,
      approvalCountAsSpender: 0,
      totalSent: "0",
      totalSentFormatted: "0.0",
      totalReceived: "0",
      totalReceivedFormatted: "0.0",
      netFlow: "0",
      netFlowFormatted: "0.0",
      uniqueCounterparties: [],
      lastActivityBlock: null,
      lastActivityTxHash: null,
    },
    transfersSent: [],
    transfersReceived: [],
    approvalsAsOwner: [],
    approvalsAsSpender: [],
  };
}

function updateSummary(
  projection: AddressProjection,
  tokenDecimals: number,
): void {
  const totalSent = projection.transfersSent.reduce(
    (acc, event) => acc + BigInt(event.value),
    0n,
  );

  const totalReceived = projection.transfersReceived.reduce(
    (acc, event) => acc + BigInt(event.value),
    0n,
  );

  const netFlow = totalReceived - totalSent;

  const counterparties = new Set<string>();

  for (const transfer of projection.transfersSent) {
    counterparties.add(normalizeAddress(transfer.to));
  }

  for (const transfer of projection.transfersReceived) {
    counterparties.add(normalizeAddress(transfer.from));
  }

  const allActivities = [
    ...projection.transfersSent,
    ...projection.transfersReceived,
    ...projection.approvalsAsOwner,
    ...projection.approvalsAsSpender,
  ].sort(compareEvents);

  const lastActivity =
    allActivities.length > 0 ? allActivities[allActivities.length - 1] : null;

  projection.summary = {
    transferCountSent: projection.transfersSent.length,
    transferCountReceived: projection.transfersReceived.length,
    approvalCountAsOwner: projection.approvalsAsOwner.length,
    approvalCountAsSpender: projection.approvalsAsSpender.length,
    totalSent: totalSent.toString(),
    totalSentFormatted: formatUnits(totalSent, tokenDecimals),
    totalReceived: totalReceived.toString(),
    totalReceivedFormatted: formatUnits(totalReceived, tokenDecimals),
    netFlow: netFlow.toString(),
    netFlowFormatted: formatUnits(netFlow, tokenDecimals),
    uniqueCounterparties: Array.from(counterparties).sort(),
    lastActivityBlock: lastActivity?.blockNumber ?? null,
    lastActivityTxHash: lastActivity?.transactionHash ?? null,
  };
}

export async function writeAddressProjections(
  events: IndexedEvent[],
  tokenDecimals: number,
): Promise<void> {
  await mkdir(BY_ADDRESS_DIR, { recursive: true });

  const projections = new Map<string, AddressProjection>();

  function ensureProjection(address: string): AddressProjection {
    const normalized = normalizeAddress(address);

    if (!projections.has(normalized)) {
      projections.set(normalized, emptyProjection(normalized));
    }

    return projections.get(normalized)!;
  }

  for (const event of events) {
    if (event.type === "Transfer") {
      ensureProjection(event.from).transfersSent.push(event);
      ensureProjection(event.to).transfersReceived.push(event);
    }

    if (event.type === "Approval") {
      ensureProjection(event.owner).approvalsAsOwner.push(event);
      ensureProjection(event.spender).approvalsAsSpender.push(event);
    }
  }

  for (const projection of projections.values()) {
    updateSummary(projection, tokenDecimals);
  }

  for (const [address, projection] of projections.entries()) {
    await writeFile(
      `${BY_ADDRESS_DIR}/${address}.json`,
      JSON.stringify(projection, null, 2),
    );
  }
}