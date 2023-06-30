import { ethers } from "ethers";
import Chain from '../chain';
import Ipfs from '../ipfs';
import { getTimestamp } from '../utils';
import { logger } from '../utils/logger';
import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { createRecordOperator } from '../db/operator';
import { 
  POLYGON_STORAGE_CONTRACT_ADDRESS,
  STORAGE_ORDER_EVM_ABI,
  POLYGON_ACCOUNT,
  CRUST_CHAIN_URL,
  POLYGON_ENDPOINT_URL 
} from '../consts';

export async function createMonitorPOLYGONTask(
  context: AppContext
): Promise<Task> {
  return {
    name: "Monitor-polygon",
    start: async (context: AppContext) => {
      // If you don't specify a //url//, Ethers connects to the default 
      // (i.e. ``http:/\/localhost:8545``)
      if (POLYGON_ENDPOINT_URL === '') {
        logger.error("Monitor chain address cannot be null!");
        process.exit(1);
      }

      if (POLYGON_ACCOUNT === '') {
        logger.error("Current node address cannot be null!");
        process.exit(1);
      }

      logger.info('Start "monitor-polygon" service:');
      logger.info(`  Monitor chain rpc:${POLYGON_ENDPOINT_URL}`);
      logger.info(`  Smart contract address:${POLYGON_STORAGE_CONTRACT_ADDRESS}`);
      logger.info(`  Crust chain rpc:${CRUST_CHAIN_URL}`);
      logger.info(`  Current node address:${POLYGON_ACCOUNT}`);
      const provider = new ethers.providers.JsonRpcProvider(POLYGON_ENDPOINT_URL);

      // The provider also allows signing transactions to
      // send ether and pay to change state within the blockchain.
      // For this, we need the account signer...
      const signer = provider.getSigner();
      const StorageOrderContract = new ethers.Contract(POLYGON_STORAGE_CONTRACT_ADDRESS, STORAGE_ORDER_EVM_ABI, provider);
      const db = context.database;
      const dbOps = createRecordOperator(db);

      // Receive an event when ANY transfer occurs
      StorageOrderContract.on("Order", async(
        customer: string,
        merchant: string,
        cid: string,
        size: number,
        price: number,
        isPermanent: boolean,
        event
      ) => {
        if (POLYGON_ACCOUNT === merchant) {
          await dbOps.addRecord(
            customer,
            merchant,
            cid,
            size,
            "MATIC",
            price.toString(),
            event.blockNumber,
            "polygon",
            isPermanent,
            event.transactionHash,
            getTimestamp(),
          );
        }
      });

      logger.info('task "monitor-polygon" started');
    },
    stop: async () => {
      return true;
    }
  }
}
