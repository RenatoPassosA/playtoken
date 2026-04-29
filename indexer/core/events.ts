import { formatUnits } from "ethers";
import type {
  ApprovalArgs,
  IndexedApproval,
  IndexedEvent,
  IndexedTransfer,
  QueryEventLike,
  TransferArgs,
} from "./types.js";
import { compareEvents, getLogIndex, getTransactionIndex } from "./utils.js";

export async function fetchIndexedEvents(
  token: any,
  fromBlock: number,
  toBlock: number,
  tokenDecimals: number,
): Promise<IndexedEvent[]> {
  const transferEvents = (await token.queryFilter(
    token.filters.Transfer(),
    fromBlock,
    toBlock,
  )) as QueryEventLike[];

  const approvalEvents = (await token.queryFilter(
    token.filters.Approval(),
    fromBlock,
    toBlock,
  )) as QueryEventLike[];

  const transfers: IndexedTransfer[] = transferEvents.map((event) => {
    const args = event.args as TransferArgs;

    return {
      type: "Transfer",
      blockNumber: event.blockNumber,
      blockHash: event.blockHash,
      transactionHash: event.transactionHash,
      transactionIndex: getTransactionIndex(event),
      logIndex: getLogIndex(event),
      address: event.address,
      from: args.from,
      to: args.to,
      value: args.value.toString(),
      valueFormatted: formatUnits(args.value, tokenDecimals),
    };
  });

  const approvals: IndexedApproval[] = approvalEvents.map((event) => {
    const args = event.args as ApprovalArgs;

    return {
      type: "Approval",
      blockNumber: event.blockNumber,
      blockHash: event.blockHash,
      transactionHash: event.transactionHash,
      transactionIndex: getTransactionIndex(event),
      logIndex: getLogIndex(event),
      address: event.address,
      owner: args.owner,
      spender: args.spender,
      value: args.value.toString(),
      valueFormatted: formatUnits(args.value, tokenDecimals),
    };
  });

  return [...transfers, ...approvals].sort(compareEvents);
}