import { Database } from 'sqlite';
import MainnetApi from '../chain';
import IpfsApi from '../ipfs';

export interface AppContext {
  database: Database;
  mainnetApi: MainnetApi;
  ipfsApi: IpfsApi;
}
