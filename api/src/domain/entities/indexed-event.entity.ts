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