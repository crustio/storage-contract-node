type FileStatus =
  | 'new'
  | 'ordered'
  | 'pinned';

export interface Record {
  id: number;
  cid: string;
  size: number;
  blockNumber: number;
  txHash: string;
  status: FileStatus;
}

export interface ElrondTimestamp {
  id: number;
  timestamp: number;
}

export interface DbOperator {
  addRecord: (
    cid: string,
    size: number,
    token: string,
    price: string,
    blockNumber: number,
    chainType: string,
    txHash: string,
    timestamp: number,
  ) => Promise<void>;
  getNewRecord: () => Promise<Record[]>;
  getOrderedRecord: () => Promise<Record[]>;
  getElrondLatestTimestamp: () => Promise<number>;
  updateStatus: (id: number, status: FileStatus) => Promise<void>;
  increaseTryout: (id: number) => Promise<void>;
}
