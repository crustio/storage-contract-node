import { AppContext } from '../types/context';
import { formatError } from '../utils';
import { logger } from '../utils/logger';
import { createRecordOperator } from '../db/operator';
import { makeIntervalTask } from '../tasks/task-utils';

async function handlePin(context: AppContext): Promise<void> {
  const dbOps = createRecordOperator(context.database);
  const records = await dbOps.getOrderedRecord();
  for (const record of records) {
    try {
      logger.info(`Pin file cid:${record.cid}, size:${record.size}`);
      await context.ipfsApi.pinAdd(record.cid)
      await dbOps.updateStatus(record.id, 'pinned');
    } catch(e) {
      await dbOps.increaseTryout(record.id);
      logger.error('unexpected exception occurs, error message:%s', formatError(e));
    }
  }
}

export async function createPinTask(context: AppContext) {
  const pinInterval = 15 * 1000;
  return makeIntervalTask(
    pinInterval,
    pinInterval,
    'ipfs-pin',
    context,
    handlePin,
  );
}
