import BigNumber from 'bignumber.js';

export interface StorageEvent {
  customer: string;
  merchant: string;
  cid: string;
  token: string;
  price: BigNumber;
  size: BigNumber;
  isPermanent: boolean;
}
