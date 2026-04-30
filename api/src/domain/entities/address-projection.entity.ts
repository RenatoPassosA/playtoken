import type { IndexedApproval, IndexedTransfer } from "./indexed-event.entity";

export type AddressSummary = {
  transferCountSent: number;
  transferCountReceived: number;
  approvalCountAsOwner: number;
  approvalCountAsSpender: number;
  totalSent: string;
  totalSentFormatted: string;
  totalReceived: string;
  totalReceivedFormatted: string;
  netFlow: string;
  netFlowFormatted: string;
  uniqueCounterparties: string[];
  lastActivityBlock: number | null;
  lastActivityTxHash: string | null;
};

export type AddressProjection = {
  address: string;
  summary: AddressSummary;
  transfersSent: IndexedTransfer[];
  transfersReceived: IndexedTransfer[];
  approvalsAsOwner: IndexedApproval[];
  approvalsAsSpender: IndexedApproval[];
};