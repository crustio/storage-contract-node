type FileStatus =
  | 'new'
  | 'ordered'
  | 'pinned'
  | 'failed'
  | 'tryout';

export interface Record {
  id: number;
  cid: string;
  size: number;
  blockNumber: number;
  txHash: string;
  status: FileStatus;
}

export interface RecordShow {
  customer: string;
  merchant: string;
  cid: string;
  size: number;
  token: string;
  price: string;
  chainType: string;
  blockNumber: number;
  txHash: string;
  timestamp: number;
  status: FileStatus;
}

export interface ElrondTimestamp {
  id: number;
  timestamp: number;
}

export interface DbOperator {
  addRecord: (
    customer: string,
    merchant: string,
    cid: string,
    size: number,
    token: string,
    price: string,
    blockNumber: number,
    chainType: string,
    txHash: string,
    timestamp: number,
  ) => Promise<void>;
  getRecordByType: (
    status: string,
    chainType: string,
  ) => Promise<RecordShow[]>;
  getNewRecord: () => Promise<Record[]>;
  getOrderedRecord: () => Promise<Record[]>;
  getElrondLatestTimestamp: () => Promise<number>;
  getXStorageLatestBlkNum: () => Promise<number>;
  getAptosLatestVersion: () => Promise<number>;
  updateStatus: (id: number, status: FileStatus) => Promise<void>;
  increaseTryout: (id: number, step = 1) => Promise<void>;
}
