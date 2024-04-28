import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { logger } from '../utils/logger';
import { makeIntervalTask, listenEVMOrderEvents } from './task-utils';
import {
  STORAGE_ORDER_EVM_ABI,
  STORAGE_ORDER_EVM_TOPICS,
  EVMChainType, BLAST_ACCOUNT, BLAST_STORAGE_CONTRACT_ADDRESS, BLAST_ENDPOINT_URL
} from '../consts';

async function handleMonitorBlast(
  context: AppContext
): Promise<void> {
  await listenEVMOrderEvents(
    context,
    BLAST_ACCOUNT,
    BLAST_ENDPOINT_URL,
    BLAST_STORAGE_CONTRACT_ADDRESS,
    STORAGE_ORDER_EVM_ABI,
    STORAGE_ORDER_EVM_TOPICS,
    EVMChainType.BLAST,
  );
}

export async function createMonitorBlastTask(
  context: AppContext
): Promise<Task> {
  logger.info(`---> Blast contract address:${BLAST_STORAGE_CONTRACT_ADDRESS}`);
  logger.info(`---> Blast account:${BLAST_ACCOUNT}`);
  logger.info(`---> Blast endpoint:${BLAST_ENDPOINT_URL}`);
  const monitorInterval = 15 * 1000;
  return makeIntervalTask(
    monitorInterval,
    monitorInterval,
    'Monitor-blast',
    context,
    handleMonitorBlast,
  );
}
