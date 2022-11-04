import { ethers } from "ethers";
import { EventFetcher } from "@arbitrum/sdk";
import { AppContext } from '../types/context';
import { getTimestamp } from '../utils';
import { logger } from '../utils/logger';
import { createRecordOperator } from '../db/operator';
import { makeIntervalTask } from '../tasks/task-utils';
import { 
  ARB1_STORAGE_CONTRACT_ADDRESS,
  ARB1_ACCOUNT,
  ARB1_ENDPOINT_URL,
  STORAGE_ORDER_ABI } from '../consts';

class StorageOrder_factory {
  private contract: ethers.Contract;

  constructor(contract: any) {
    this.contract = contract;
  }

  connect(): ethers.Contract {
    return this.contract;
  }

  createInterface(): ethers.utils.Interface {
    return this.contract.interface;
  }
}

async function handleARB1(context: AppContext): Promise<void> {
  if (ARB1_ENDPOINT_URL === '') {
    logger.error("Monitor chain address cannot be null!");
    process.exit(1);
  }
  
  if (ARB1_ACCOUNT === '') {
    logger.error("Current node address cannot be null!");
    process.exit(1);
  }

  const provider = new ethers.providers.JsonRpcProvider(ARB1_ENDPOINT_URL);
  const StorageOrderContract = new ethers.Contract(ARB1_STORAGE_CONTRACT_ADDRESS, STORAGE_ORDER_ABI, provider);
  const socFactory = new StorageOrder_factory(StorageOrderContract);
  const eFetcher = new EventFetcher(provider);

  const dbOps = createRecordOperator(context.database);
  const latestBlkNum = await dbOps.getARB1LatestBlkNum();
  const events = await eFetcher.getEvents(
    socFactory,
    b => b.filters.Order(),
    {
      fromBlock: latestBlkNum,
      toBlock: 'latest',
    }
  );

  const txArray = JSON.parse(JSON.stringify(events));
  for (const tx of txArray) {
    if (tx.event[1] === ARB1_ACCOUNT) {
      dbOps.addRecord(
        tx.event[0],
        tx.event[1],
        tx.event[2],
        Number(BigInt(tx.event[3].hex)),
        "ETH",
        BigInt(tx.event[4].hex).toString(10),
        tx.blockNumber,
        "arb1",
        tx.transactionHash,
        getTimestamp(),
      );
    }
  }
}

export async function createMonitorARB1Task(context: AppContext) {
  const arb1Interval = 10 * 1000;
  return makeIntervalTask(
    arb1Interval,
    arb1Interval,
    'monitor-arb1',
    context,
    handleARB1,
  );
}
