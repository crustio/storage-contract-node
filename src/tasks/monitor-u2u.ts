import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { logger } from '../utils/logger';
import { makeIntervalTask, listenEVMOrderEvents } from './task-utils';
import {
  STORAGE_ORDER_EVM_ABI,
  STORAGE_ORDER_EVM_TOPICS,
  EVMChainType, U2U_ACCOUNT, U2U_ENDPOINT_URL, U2U_STORAGE_CONTRACT_ADDRESS,
} from '../consts';

async function handleMonitorU2U(
  context: AppContext
): Promise<void> {
  await listenEVMOrderEvents(
    context,
    U2U_ACCOUNT,
    U2U_ENDPOINT_URL,
    U2U_STORAGE_CONTRACT_ADDRESS,
    STORAGE_ORDER_EVM_ABI,
    STORAGE_ORDER_EVM_TOPICS,
    EVMChainType.U2U,
  );
}

export async function createMonitorU2UTask(
  context: AppContext
): Promise<Task> {
  logger.info(`---> U2U contract address:${U2U_STORAGE_CONTRACT_ADDRESS}`);
  logger.info(`---> U2U account:${U2U_ACCOUNT}`);
  logger.info(`---> U2U endpoint:${U2U_ENDPOINT_URL}`);
  const monitorInterval = 15 * 1000;
  return makeIntervalTask(
    monitorInterval,
    monitorInterval,
    'Monitor-u2u',
    context,
    handleMonitorU2U,
  );
}
