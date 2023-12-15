import algosdk, { encodeAddress } from 'algosdk';
import _ from "lodash";
import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { logger } from '../utils/logger';
import { createRecordOperator } from '../db/operator';
import { makeIntervalTask } from '../tasks/task-utils';
import {
  ALGO_ACCOUNT,
  ALGO_INDEXER_PORT,
  ALGO_INDEXER_URL,
  ALGO_STORAGE_APP_ID,
  ALGO_TOKEN,
} from '../consts';
import BigNumber from "bignumber.js";

const chainType = "algorand";
const coinTag = "algo";

class AlgorandAddress { constructor(value?:string) {} }

class StorageOrderEvent {
  customer = new AlgorandAddress();
  merchant = new AlgorandAddress();
  cid = "";
  size = new BigNumber(0);
  price = new BigNumber(0);
  isPermanent = false;
  blockNumber = 0;
  txHash = "";
  timestamp = 0;
}

async function handleAlgorand(
  context: AppContext
): Promise<void> {
  const dbOps = createRecordOperator(context.database);
  const algoIndexerClient = new algosdk.Indexer(
    ALGO_TOKEN,
    ALGO_INDEXER_URL,
    ALGO_INDEXER_PORT,
  );
  const limit = 50;
  const getAppLogs = async (minRound: number, next: string) => {
    const lookupLogs = algoIndexerClient.lookupApplicationLogs(ALGO_STORAGE_APP_ID);
    lookupLogs.limit(limit);
    lookupLogs.minRound(minRound);
    if (next !== "") {
      lookupLogs.nextToken(next)
    }
    return await lookupLogs.do();
  };
  const isEvent = (data: string) => {
    const buf = Buffer.from(data, 'base64');
    return buf.indexOf("$eventName$") !== -1;
  };
  let lastIndexBlock = await dbOps.getMonitorBlkNum(chainType);
  if (lastIndexBlock === -1) lastIndexBlock = 0;
  try {
    // console.log(`get logs from round:${lastIndexBlock}`);
    let logDataEvents: any[] = [];
    let logNextToken = '';
    let currentBlock = lastIndexBlock;
    let hasLogs = false;
    while (true) {
        try {
            const rawLogs = await getAppLogs(lastIndexBlock, logNextToken);
            const logs = JSON.parse(JSON.stringify(rawLogs));
            const currentEvents = _.flatten(
              _.map(logs['log-data'], entry => 
                _.flattenDeep(entry['logs'])
                .map(l => ({data:l,txHash:entry['txid']}))
              )
            )
            .filter(i => isEvent(i['data'] as string))
            .map(i => {
              const event = parseEvent(i['data'] as string);
              Object.assign(event, { txHash: i['txHash'] });
              return event;
            });
            if (_.isEmpty(currentEvents)) break;
            logDataEvents = _([] as any[]).concat(
              ...logDataEvents,
              ...currentEvents,
            ).value();
            currentBlock = logs['current-round'];
            logNextToken = logs['next-token'];
            hasLogs = true;
        } catch (e: any) {
          logger.error(`Index edition failed msg: ${e.message} stack: ${e.stack}`);
          return;
        }
    }
    for (const event of logDataEvents) {
      if (ALGO_ACCOUNT === event.merchant) {
        await dbOps.addRecord(
          event.customer,
          event.merchant,
          event.cid,
          event.size.toNumber(),
          coinTag,
          event.price.toString(),
          event.blockNumber,
          chainType,
          event.isPermanent,
          event.txHash,
          event.timestamp,
        );
      }
    }
    if (hasLogs) {
      await dbOps.setMonitorBlkNum(currentBlock+1, chainType);
    }
  } catch (e: any) {
    logger.error(`Get ${chainType} logs from round:${lastIndexBlock} failed, error ${e.message}.`);
  }
}

function parseEvent(base64Str: string) {
  const buf = Buffer.from(base64Str, 'base64');
  const t = new StorageOrderEvent();
  const eventKeys = Object.keys(t);
  const {...obj} = t;
  for (const key of eventKeys) {
    const val = extractValueFromBuffer(buf, key, t[key as keyof StorageOrderEvent].constructor.name);
    if (val) {
      Object.assign(obj, { [key]: val } );
    }
  }
  return obj;
}

function getLocatedBuffer(buf: Buffer, tag: string): Buffer {
  const startTag = `$${tag}$`
  const endTag = `$${tag}End$`
  if (buf.indexOf(startTag) === -1) {
    throw new Error(`Tag:${tag} not found`);
  }
  const sp = buf.indexOf(startTag) + startTag.length;
  const ep = buf.indexOf(endTag);
  return buf.subarray(sp,ep);
}

function getNumberFromBuffer(buf: Buffer, tag: string): number {
  return parseInt(getLocatedBuffer(buf, tag).toString('hex'), 16);
}

function getStringFromBuffer(buf: Buffer, tag: string): string {
  return  getLocatedBuffer(buf, tag).toString();
}

function getAddressFromBuffer(buf: Buffer, tag: string): string {
  return encodeAddress(getLocatedBuffer(buf, tag));
}

function extractValueFromBuffer(buf: Buffer, key: string, keyType: string) {
  try {
    switch (keyType) {
      case 'String':
        return getStringFromBuffer(buf, key);
      case 'Number':
        return getNumberFromBuffer(buf, key);
      case 'Boolean':
        return getNumberFromBuffer(buf, key) == 1;
      case 'BigNumber':
        return new BigNumber(getNumberFromBuffer(buf, key));
      case 'AlgorandAddress':
        return getAddressFromBuffer(buf, key);
    }
  } catch (e: any) {
    return null;
  }
}

export async function createMonitorAlgorandTask(
  context: AppContext
): Promise<Task> {
  logger.info(`---> Algorand application id:${ALGO_STORAGE_APP_ID}`);
  logger.info(`---> Algorand account:${ALGO_ACCOUNT}`);
  logger.info(`---> Algorand indexer:${ALGO_INDEXER_URL}`);
  const algorandInterval = 10 * 1000;
  return makeIntervalTask(
    algorandInterval,
    algorandInterval,
    'monitor-algorand',
    context,
    handleAlgorand,
  );
}
