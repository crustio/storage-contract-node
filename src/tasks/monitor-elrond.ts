import urlJoin from 'url-join';
import { AppContext } from '../types/context';
import { formatError, httpGet } from '../utils';
import { getTimestamp } from '../utils';
import { logger } from '../utils/logger';
import parseStorageEvent from '../utils/elrond-parser';
import { createRecordOperator } from '../db/operator';
import { makeIntervalTask } from '../tasks/task-utils';
import {
  ELROND_ACCOUNT,
  ELROND_API_URL,
  ELROND_STORAGE_CONTRACT_ADDRESS,
} from '../consts';

async function handleElrond(context: AppContext): Promise<void> {
  const dbOps = createRecordOperator(context.database);
  const timestamp = await dbOps.getElrondLatestTimestamp();
  const url = urlJoin(
    ELROND_API_URL, 
    'accounts', 
    ELROND_STORAGE_CONTRACT_ADDRESS,
    'transactions',
    '?size=50',
    '&status=success',
    '&withOperations=true',
    '&withLogs=true',
    `&after=${timestamp}`,
  );
  try {
    const res = await httpGet(url);
    if (res.status === 200) {
      const txArray = JSON.parse(JSON.stringify(res.data));
      for (const tx of txArray) {
        if (tx.hasOwnProperty("function")
          && tx["function"].startsWith("placeOrder")
          && tx.hasOwnProperty("logs") 
          && tx["logs"].hasOwnProperty("events")) {
          for (const event of tx.logs.events) {
            if (event.hasOwnProperty("identifier") && event["identifier"].startsWith("placeOrder")) {
              const eventObj = parseStorageEvent(event.data);
              if (eventObj.merchant === ELROND_ACCOUNT) {
                //logger.info(`Add new Elrond task:`);
                //Object.entries(eventObj).forEach(([key, val]) => logger.info(`    ${key}:${val}`));
                dbOps.addRecord(
                  eventObj.customer,
                  eventObj.merchant,
                  eventObj.cid,
                  parseInt(eventObj.size.toString()),
                  eventObj.token,
                  eventObj.price.toString(),
                  tx.timestamp,
                  "elrond",
                  tx.txHash,
                  getTimestamp(),
                );
              }
              break;
            }
          }
        }
      }
    }
  } catch(e:any) {
    logger.error(`Get elrond event data failed, error message:${e}`);
  }
}

export async function createMonitorElrondTask(context: AppContext) {
  const elrondInterval = 10 * 1000;
  return makeIntervalTask(
    elrondInterval,
    elrondInterval,
    'monitor-elrond',
    context,
    handleElrond,
  );
}
