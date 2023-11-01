import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { logger } from '../utils/logger';
import { makeIntervalTask, listenEVMOrderEvents } from './task-utils';
import { 
  POLYGONZK_ACCOUNT,
  POLYGONZK_ENDPOINT_URL,
  POLYGONZK_STORAGE_CONTRACT_ADDRESS,
  STORAGE_ORDER_EVM_ABI,
  STORAGE_ORDER_EVM_TOPICS,
  EVMChainType
} from '../consts';

async function handleMonitorPolygonZK(
  context: AppContext
): Promise<void> {
  await listenEVMOrderEvents(
    context,
    POLYGONZK_ACCOUNT,
    POLYGONZK_ENDPOINT_URL,
    POLYGONZK_STORAGE_CONTRACT_ADDRESS,
    STORAGE_ORDER_EVM_ABI,
    STORAGE_ORDER_EVM_TOPICS,
    EVMChainType.POLYGONZK,
  );
}

export async function createMonitorPolygonZKTask(
  context: AppContext
): Promise<Task> {
  logger.info(`---> Ploygon zkEVM contract address:${POLYGONZK_STORAGE_CONTRACT_ADDRESS}`);
  logger.info(`---> Ploygon zkEVM account:${POLYGONZK_ACCOUNT}`);
  logger.info(`---> Ploygon zkEVM endpoint:${POLYGONZK_ENDPOINT_URL}`);
  const monitorInterval = 15 * 1000;
  return makeIntervalTask(
    monitorInterval,
    monitorInterval,
    'Monitor-polygonzk',
    context,
    handleMonitorPolygonZK,
  );
}
