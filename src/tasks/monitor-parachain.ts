import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { logger } from '../utils/logger';
import { makeIntervalTask, listenEVMOrderEvents } from './task-utils';
import {
  STORAGE_ORDER_EVM_ABI,
  STORAGE_ORDER_EVM_TOPICS,
  EVMChainType,
  BLAST_ACCOUNT,
  BLAST_STORAGE_CONTRACT_ADDRESS,
  BLAST_ENDPOINT_URL,
  PARA_CHAIN_STORAGE_CONTRACT_ADDRESS,
  PARA_CHAIN_ACCOUNT, PARA_CHAIN_ENDPOINT_URL
} from '../consts';

async function handleMonitorParaChain(
  context: AppContext
): Promise<void> {
  await listenEVMOrderEvents(
    context,
    PARA_CHAIN_ACCOUNT,
    PARA_CHAIN_ENDPOINT_URL,
    PARA_CHAIN_STORAGE_CONTRACT_ADDRESS,
    STORAGE_ORDER_EVM_ABI,
    STORAGE_ORDER_EVM_TOPICS,
    EVMChainType.PARA,
  );
}

export async function createMonitorParaChainTask(
  context: AppContext
): Promise<Task> {
  logger.info(`---> Para chain contract address:${PARA_CHAIN_STORAGE_CONTRACT_ADDRESS}`);
  logger.info(`---> Para chain account:${PARA_CHAIN_ACCOUNT}`);
  logger.info(`---> Para chain endpoint:${PARA_CHAIN_ENDPOINT_URL}`);
  const monitorInterval = 15 * 1000;
  return makeIntervalTask(
    monitorInterval,
    monitorInterval,
    'Monitor-parachain',
    context,
    handleMonitorParaChain,
  );
}
