import { Database } from 'sqlite';
import ChainApi from '../chain';
import IpfsApi from '../ipfs';

export interface AppContext {
  database: Database;
  chainApi: ChainApi;
  ipfsApi: IpfsApi;
}
