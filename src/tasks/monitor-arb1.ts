import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { logger } from '../utils/logger';
import { makeIntervalTask, listenEVMOrderEvents } from './task-utils';
import { 
  ARB1_STORAGE_CONTRACT_ADDRESS,
  STORAGE_ORDER_EVM_ABI,
  STORAGE_ORDER_EVM_TOPICS,
  ARB1_ACCOUNT,
  ARB1_ENDPOINT_URL,
  EVMChainType
} from '../consts';

async function handleMonitorArb1(
  context: AppContext
): Promise<void> {
  await listenEVMOrderEvents(
    context,
    ARB1_ACCOUNT,
    ARB1_ENDPOINT_URL,
    ARB1_STORAGE_CONTRACT_ADDRESS,
    STORAGE_ORDER_EVM_ABI,
    STORAGE_ORDER_EVM_TOPICS,
    EVMChainType.ARB1,
  );
}

export async function createMonitorARB1Task(
  context: AppContext
): Promise<Task> {
  logger.info(`---> Arb1 contract address:${ARB1_STORAGE_CONTRACT_ADDRESS}`);
  logger.info(`---> Arb1 account:${ARB1_ACCOUNT}`);
  logger.info(`---> Arb1 endpoint:${ARB1_ENDPOINT_URL}`);
  const monitorInterval = 15 * 1000;
  return makeIntervalTask(
    monitorInterval,
    monitorInterval,
    'Monitor-arb1',
    context,
    handleMonitorArb1,
  );
}
