import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { logger } from '../utils/logger';
import { makeIntervalTask, listenEVMOrderEvents } from './task-utils';
import {
  STORAGE_ORDER_EVM_ABI,
  STORAGE_ORDER_EVM_TOPICS,
  EVMChainType, BASE_ACCOUNT, BASE_ENDPOINT_URL, BASE_STORAGE_CONTRACT_ADDRESS
} from '../consts';

async function handleMonitorBase(
  context: AppContext
): Promise<void> {
  await listenEVMOrderEvents(
    context,
    BASE_ACCOUNT,
    BASE_ENDPOINT_URL,
    BASE_STORAGE_CONTRACT_ADDRESS,
    STORAGE_ORDER_EVM_ABI,
    STORAGE_ORDER_EVM_TOPICS,
    EVMChainType.BASE,
  );
}

export async function createMonitorBaseTask(
  context: AppContext
): Promise<Task> {
  logger.info(`---> Base contract address:${BASE_STORAGE_CONTRACT_ADDRESS}`);
  logger.info(`---> Base account:${BASE_ACCOUNT}`);
  logger.info(`---> Base endpoint:${BASE_ENDPOINT_URL}`);
  const monitorInterval = 15 * 1000;
  return makeIntervalTask(
    monitorInterval,
    monitorInterval,
    'Monitor-base',
    context,
    handleMonitorBase,
  );
}
