import { encodeAddress } from 'alsosdk';
import urlJoin from 'url-join';
import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { getTimestamp, httpGet } from '../utils';
import { logger } from '../utils/logger';
import { createRecordOperator } from '../db/operator';
import { makeIntervalTask } from '../tasks/task-utils';
import {
  ALGO_ACCOUNT,
  ALGO_INDEXER_URL,
  ALGO_STORAGE_APP_ID,
} from '../consts';

async function handleAptos(
  context: AppContext
): Promise<void> {
  const dbOps = createRecordOperator(context.database);
  const chainType = "algorand";
  const minRound = await dbOps.getMonitorBlkNum(chainType);
  let next = ""
  const getUrl = (round: number, next: string) => urlJoin(
    ALGO_INDEXER_URL, 
    `/v2/applications/${ALGO_STORAGE_APP_ID}/logs`,
    '?limit=50',
    `&min-round=${minRound}`,
    `${next}`,
  )
  try {
    let currentRound = 0;
    let tryout = 1000;
    while(--tryout > 0) {
      const res = await httpGet(getUrl(minRound, next));
      if (res.status !== 200) break;
      const logs = JSON.parse(JSON.stringify(res.data));
      if (!logs.hasOwnProperty('log-data') || !logs.hasOwnProperty('current-round')) break;
      currentRound = logs['current-round'];
      for (const log of logs['log-data']) {
        if (log.hasOwnProperty('logs') && log.logs[0].length < 46) continue;
        const buf = Buffer.from(log.logs[0])
        const merchant = getAddressFromBuffer(buf, "$merchant$", "$merchant_end$");
        if (ALGO_ACCOUNT === merchant) {
          const customer = getAddressFromBuffer(buf, "$customer$", "$customer_end$");
          const cid = getStringFromBuffer(buf, "$cid$", "$cid_end$");
          const size = getIntFromBuffer(buf, "$size$", "$size_end$");
          const price = getIntFromBuffer(buf, "$price$", "$price_end$");
          const isPermanent = getIntFromBuffer(buf, "$is_permanent$", "$is_permanent_end$");
          await dbOps.addRecord(
            customer,
            merchant,
            cid,
            size,
            chainType,
            price.toString(),
            logs['current-round'],
            chainType,
            isPermanent,
            log.hasOwnProperty('txid') ?? 'unknown',
            getTimestamp(),
          );
        }
      }
      if (!logs.hasOwnProperty('next-token')) break;
      next = `&next=${logs['next-token']}`;
    }
    await dbOps.setMonitorBlkNum(currentRound + 1, chainType);
  } catch (e: any) {
    logger.error(`Get ${chainType} logs from round:${minRound} failed, error ${e.message}.`);
  }
}

function getStringFromBuffer(
  buf: BUffer,
  start_tag: string,
  end_tag: string
): string {
  const sp = buf.indexOf(start_tag) + start_tag.length;
  const ep = buf.indexOf(end_tag);
  return buf.subarray(sp,ep).toString();
}

function getAddressFromBuffer(
  buf: BUffer,
  start_tag: string,
  end_tag: string
): string {
  const sp = buf.indexOf(start_tag) + start_tag.length;
  const ep = buf.indexOf(end_tag);
  return encodeAddress(buf.subarray(sp,ep));
}

function getIntFromBuffer(
  buf: BUffer,
  start_tag: string,
  end_tag: string
): number {
  const sp = buf.indexOf(start_tag) + start_tag.length;
  const ep = buf.indexOf(end_tag);
  return parseInt(buf.subarray(sp,ep).toString('hex'), 16);
}

export async function createMonitorAlgorandTask(
  context: AppContext
): Promise<Task> {
  const aptosInterval = 10 * 1000;
  return makeIntervalTask(
    aptosInterval,
    aptosInterval,
    'monitor-algorand',
    context,
    handleAlgorand,
  );
}
