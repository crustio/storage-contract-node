import BigNumber from 'bignumber.js';

export interface StorageEvent {
  caller: string;
  node: string;
  cid: string;
  token: string;
  price: BigNumber;
  size: BigNumber;
}
