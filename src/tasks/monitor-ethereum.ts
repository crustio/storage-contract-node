import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { logger } from '../utils/logger';
import { makeIntervalTask, listenEVMOrderEvents } from './task-utils';
import { 
  ETH_STORAGE_CONTRACT_ADDRESS,
  STORAGE_ORDER_EVM_ABI,
  STORAGE_ORDER_EVM_TOPICS,
  ETH_ACCOUNT,
  ETH_ENDPOINT_URL,
  EVMChainType
} from '../consts';

async function handleMonitorETH(
  context: AppContext
): Promise<void> {
  await listenEVMOrderEvents(
    context,
    ETH_ACCOUNT,
    ETH_ENDPOINT_URL,
    ETH_STORAGE_CONTRACT_ADDRESS,
    STORAGE_ORDER_EVM_ABI,
    STORAGE_ORDER_EVM_TOPICS,
    EVMChainType.ETHEREUM,
  );
}

export async function createMonitorETHTask(
  context: AppContext
): Promise<Task> {
  logger.info(`---> Ethereum contract address:${ETH_STORAGE_CONTRACT_ADDRESS}`);
  logger.info(`---> Ethereum account:${ETH_ACCOUNT}`);
  logger.info(`---> Ethereum endpoint:${ETH_ENDPOINT_URL}`);
  const monitorInterval = 15 * 1000;
  return makeIntervalTask(
    monitorInterval,
    monitorInterval,
    'Monitor-ethereum',
    context,
    handleMonitorETH,
  );
}
