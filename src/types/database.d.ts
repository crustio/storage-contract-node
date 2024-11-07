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
  txHash: string;
  chainType: string;
  blockNumber: number;
  isPermanent: boolean;
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
  isPermanent: boolean;
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
    isPermanent: boolean,
    txHash: string,
    timestamp: number,
  ) => Promise<void>;
  getRecordByType: (
    status: string,
    chainType: string,
  ) => Promise<RecordShow[]>;
  setMonitorBlkNum: (blockNumber: number, chainType: string) => Promise<void>;
  getMonitorBlkNum: (chainType: string) => Promise<number>;
  getNewRecord: () => Promise<Record[]>;
  getOrderedRecord: () => Promise<Record[]>;
  getElrondLatestTimestamp: () => Promise<number>;
  getXStorageLatestBlkNum: () => Promise<number>;
  getXStorageParaLatestBlkNum: () => Promise<number>;
  getARB1LatestBlkNum: () => Promise<number>;
  getAptosStartSequenceNumber: () => Promise<number>;
  syncToLatestBlock: () => Promise<any>;
  updateStatus: (id: number, status: FileStatus) => Promise<void>;
  increaseTryout: (id: number, step = 1) => Promise<void>;
  deleteByHash: (hash: string) => Promise<void>;
}
