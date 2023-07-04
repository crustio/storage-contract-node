import { AppContext } from '../types/context';
import { getTimestamp, sleep } from '../utils';
import { ethers } from "ethers";
import { Task } from '../types/tasks';
import { formatError } from '../utils';
import { logger } from '../utils/logger';
import { createRecordOperator } from '../db/operator';
import { EVMChainType, EVMChain2Token } from '../consts';

const axios = require('axios');

export async function makeIntervalTask(
  startDelay: number,
  interval: number, // in millseconds
  name: string,
  context: AppContext,
  handlerFn: (context: AppContext) => Promise<void>,
): Promise<Task> {
  logger.info('start task: "%s"', name);
  if (startDelay <= 0 || interval <= 0) {
    throw new Error('invalid arg, interval should be greater than 0');
  }
  let timer: NodeJS.Timeout;
  let stopped = false;

  const doInterval = async () => {
    if (stopped) {
      return;
    }
    try {
      await handlerFn(context);
    } catch (e) {
      logger.error(
        'unexpected exception running task "%s", %s',
        name,
        formatError(e),
      );
    } finally {
      //logger.info('task done: "%s"', name);
      if (!stopped) {
        timer = setTimeout(doInterval, interval);
      }
    }
  };
  return {
    name,
    start: () => {
      logger.info(`task "${name}" started`);
      timer = setTimeout(doInterval, startDelay);
      stopped = false;
    },
    stop: async () => {
      logger.info(`task "${name}" stopped`);
      stopped = true;
      if (timer) {
        clearTimeout(timer);
      }
      return true;
    },
  };
}

export async function listenEVMOrderEvents(
  context: AppContext,
  account: string,
  endpoint: string,
  contractAddress: string,
  abi: string[],
  topics: string[],
  chainType: string,
): Promise<void> {
  const provider = new ethers.providers.JsonRpcProvider(endpoint);
  const signer = provider.getSigner();
  const StorageOrderContract = new ethers.Contract(contractAddress, abi, provider);
  const db = context.database;
  const dbOps = createRecordOperator(db);

  // Receive an event when ANY transfer occurs
  const searchStep = 1000;
  const storageOrderIface = new ethers.utils.Interface(abi);
  const curBlkNum = await getEVMLatestBlkNum(endpoint);
  if (curBlkNum === -1) {
    logger.error(`Get ${chainType} latest block number failed.`);
    return;
  }
  let fromBlkNum = await dbOps.getMonitorBlkNum(chainType);
  if (fromBlkNum === -1) {
    fromBlkNum = curBlkNum;
    //logger.info(`Search ${chainType} event from:${fromBlkNum}`);
    await dbOps.setMonitorBlkNum(fromBlkNum, chainType);
  } else if (fromBlkNum > curBlkNum) {
    await dbOps.setMonitorBlkNum(curBlkNum, chainType);
    return;
  }
  const startBlkNum = fromBlkNum;
  let toBlkNum = fromBlkNum + searchStep;
  try {
    while (fromBlkNum <= curBlkNum) {
      const filter = {
        address: [contractAddress],
        topics: topics,
        fromBlock: "0x".concat(fromBlkNum.toString(16)),
        toBlock: "0x".concat(toBlkNum.toString(16)),
      }
      const events = await axios.post(
        endpoint,
        {
          id: 1,
          jsonrpc: "2.0",
          method: "eth_getLogs",
          params: [filter]
        },
        {
          "content-type": "application/json",
        }
      );
      for (const event of events.data.result) {
        const { args } = storageOrderIface.parseLog(event);
        if (account === args.merchant) {
          await dbOps.addRecord(
            args.customer,
            args.merchant,
            args.cid,
            args.size.toNumber(),
            EVMChain2Token.get(chainType) ?? 'unknown',
            args.price.toString(),
            parseInt(event.blockNumber),
            chainType,
            args.isPermanent,
            event.transactionHash,
            getTimestamp(),
          );
        }
      }
      await dbOps.setMonitorBlkNum(toBlkNum, chainType);
      fromBlkNum = toBlkNum;
      toBlkNum += searchStep;
      await sleep(1000);
    }
    await dbOps.setMonitorBlkNum(curBlkNum, chainType);
    //logger.info(`Check block ${startBlkNum} ~ ${curBlkNum} successfully.`);
  } catch (e: any) {
    logger.error(`Get ${chainType} logs from ${fromBlkNum} ~ ${toBlkNum} failed, error ${e.message}.`);
  }
}

export async function getEVMLatestBlkNum(
  endpoint: string
): Promise<number> {
  let tryout = 10;
  while (--tryout >= 0) {
    try {
      const res = await axios.post(
        endpoint,
        {
          id: 1,
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: []
        }
      );
      return parseInt(res.data.result, 16);
    } catch (e: any) {
      logger.warn(`Get block number error:${e}`);
      await sleep(3000);
    }
  }
  return -1;
}
