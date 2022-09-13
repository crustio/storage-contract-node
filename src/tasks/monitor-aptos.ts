import urlJoin from 'url-join';
import { AppContext } from '../types/context';
import { getTimestamp } from '../utils';
import { logger } from '../utils/logger';
import { createRecordOperator } from '../db/operator';
import { makeIntervalTask } from '../tasks/task-utils';
import { AptosClient, AptosAccount } from 'aptos';
import {
  APTOS_ACCOUNT,
  APTOS_NODE_URL,
  APTOS_STORAGE_MODULE_ADDRESS,
  APTOS_ORDER_EVENTS_TAG,
} from '../consts';

const orderEventTag = `${APTOS_STORAGE_MODULE_ADDRESS}::${APTOS_ORDER_EVENTS_TAG}`

async function handleAptos(context: AppContext): Promise<void> {
  if (APTOS_NODE_URL === '') {
    return;
  }

  if (APTOS_STORAGE_MODULE_ADDRESS === '') {
    return;
  }

  const dbOps = createRecordOperator(context.database);
  const latestVersion = await dbOps.getAptosLatestVersion();
  const client = new AptosClient(APTOS_NODE_URL);
  const account = new AptosAccount(undefined, APTOS_STORAGE_MODULE_ADDRESS);
  const txs = await client.getAccountTransactions(account.address(), { start: latestVersion });
  const txArray = JSON.parse(JSON.stringify(txs));
  for (const tx of txArray) {
    for (const event of tx.events) {
      if (event.type === orderEventTag && APTOS_ACCOUNT === event.data.merchant) {
        dbOps.addRecord(
          event.data.customer,
          event.data.merchant,
          event.data.cid,
          parseInt(event.data.size.toString()),
          'AptosCoin',
          event.data.price.toString(),
          tx.version,
          "aptos",
          tx.hash,
          getTimestamp(),
        );
      }
    }
  }
}

export async function createMonitorAptosTask(context: AppContext) {
  const aptosInterval = 10 * 1000;
  return makeIntervalTask(
    aptosInterval,
    aptosInterval,
    'monitor-aptos',
    context,
    handleAptos,
  );
}
