import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { logger } from '../utils/logger';
import { makeIntervalTask, listenEVMOrderEvents } from './task-utils';
import { 
  ZKSYNC_ACCOUNT,
  ZKSYNC_ENDPOINT_URL,
  ZKSYNC_STORAGE_CONTRACT_ADDRESS,
  STORAGE_ORDER_EVM_ABI,
  STORAGE_ORDER_EVM_TOPICS,
  EVMChainType
} from '../consts';

async function handleMonitorZksync(
  context: AppContext
): Promise<void> {
  await listenEVMOrderEvents(
    context,
    ZKSYNC_ACCOUNT,
    ZKSYNC_ENDPOINT_URL,
    ZKSYNC_STORAGE_CONTRACT_ADDRESS,
    STORAGE_ORDER_EVM_ABI,
    STORAGE_ORDER_EVM_TOPICS,
    EVMChainType.ZKSYNC,
  );
}

export async function createMonitorZksyncTask(
  context: AppContext
): Promise<Task> {
  logger.info(`---> Zksync contract address:${ZKSYNC_STORAGE_CONTRACT_ADDRESS}`);
  logger.info(`---> Zksync account:${ZKSYNC_ACCOUNT}`);
  logger.info(`---> Zksync endpoint:${ZKSYNC_ENDPOINT_URL}`);
  const monitorInterval = 15 * 1000;
  return makeIntervalTask(
    monitorInterval,
    monitorInterval,
    'Monitor-zksync',
    context,
    handleMonitorZksync,
  );
}
