import {
  EVMChainType,
  HEDERA_ACCOUNT,
  HEDERA_ENDPOINT_URL,
  HEDERA_STORAGE_CONTRACT_ADDRESS,
  STORAGE_ORDER_EVM_ABI,
  STORAGE_ORDER_EVM_TOPICS
} from '../consts';
import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { logger } from '../utils/logger';
import { listenEVMOrderEvents, makeIntervalTask } from './task-utils';

async function handleMonitorHedera(
  context: AppContext
): Promise<void> {
  await listenEVMOrderEvents(
    context,
    HEDERA_ACCOUNT,
    HEDERA_ENDPOINT_URL,
    HEDERA_STORAGE_CONTRACT_ADDRESS,
    STORAGE_ORDER_EVM_ABI,
    STORAGE_ORDER_EVM_TOPICS,
    EVMChainType.HEDERA,
  );
}

export async function createMonitorHederaTask(
  context: AppContext
): Promise<Task> {
  logger.info(`---> Hedera contract address:${HEDERA_STORAGE_CONTRACT_ADDRESS}`);
  logger.info(`---> Hedera account:${HEDERA_ACCOUNT}`);
  logger.info(`---> Hedera endpoint:${HEDERA_ENDPOINT_URL}`);
  const monitorInterval = 15 * 1000;
  return makeIntervalTask(
    monitorInterval,
    monitorInterval,
    'Monitor-hedera',
    context,
    handleMonitorHedera,
  );
}
