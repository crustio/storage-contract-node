import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { logger } from '../utils/logger';
import { makeIntervalTask, listenEVMOrderEvents } from './task-utils';
import { 
  OP_ACCOUNT,
  OP_ENDPOINT_URL,
  OP_STORAGE_CONTRACT_ADDRESS,
  STORAGE_ORDER_EVM_ABI,
  STORAGE_ORDER_EVM_TOPICS,
  EVMChainType
} from '../consts';

async function handleMonitorOP(
  context: AppContext
): Promise<void> {
  await listenEVMOrderEvents(
    context,
    OP_ACCOUNT,
    OP_ENDPOINT_URL,
    OP_STORAGE_CONTRACT_ADDRESS,
    STORAGE_ORDER_EVM_ABI,
    STORAGE_ORDER_EVM_TOPICS,
    EVMChainType.OPTIMISM,
  );
}

export async function createMonitorOPTask(
  context: AppContext
): Promise<Task> {
  logger.info(`---> Optimism contract address:${OP_STORAGE_CONTRACT_ADDRESS}`);
  logger.info(`---> Optimism account:${OP_ACCOUNT}`);
  logger.info(`---> Optimism endpoint:${OP_ENDPOINT_URL}`);
  const monitorInterval = 15 * 1000;
  return makeIntervalTask(
    monitorInterval,
    monitorInterval,
    'Monitor-optimism',
    context,
    handleMonitorOP,
  );
}
