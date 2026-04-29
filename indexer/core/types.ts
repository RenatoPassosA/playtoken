export type QueryEventLike = {
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  transactionIndex?: number | null;
  logIndex?: number | null;
  index?: number | null;
  log?: {
    transactionIndex?: number | null;
    index?: number | null;
  };
  address: string;
  args: unknown;
};

export type TransferArgs = {
  from: string;
  to: string;
  value: bigint;
};

export type ApprovalArgs = {
  owner: string;
  spender: string;
  value: bigint;
};

export type IndexedTransfer = {
  type: "Transfer";
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  transactionIndex: number;
  logIndex: number;
  address: string;
  from: string;
  to: string;
  value: string;
  valueFormatted: string;
};

export type IndexedApproval = {
  type: "Approval";
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  transactionIndex: number;
  logIndex: number;
  address: string;
  owner: string;
  spender: string;
  value: string;
  valueFormatted: string;
};

export type IndexedEvent = IndexedTransfer | IndexedApproval;

export type Checkpoint = {
  contractAddress: string;
  lastProcessedBlock: number;
  updatedAt: string;
  totalIndexedEvents: number;
  finalityMargin: number;
};

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