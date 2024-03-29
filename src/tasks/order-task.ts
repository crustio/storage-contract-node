import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { isJSON, formatError } from '../utils';
import { logger } from '../utils/logger';
import { createRecordOperator } from '../db/operator';
import { makeIntervalTask } from '../tasks/task-utils';
import { CHAIN_STATUS_CODE } from '../chain';
import { TRYOUT } from '../consts';

async function handleOrder(
  context: AppContext
): Promise<void> {
  const dbOps = createRecordOperator(context.database);
  const records = await dbOps.getNewRecord();
  for (const record of records) {
    try {
      logger.info(`Place order cid:${record.cid}, size:${record.size}`);
      await context.mainnetApi.order(
        record.cid, 
        record.size, 
        record.txHash, 
        record.chainType, 
        record.isPermanent
      );
      await dbOps.updateStatus(record.id, 'ordered');
    } catch(e: any) {
      if (isJSON(e.message)) {
        const eJson = JSON.parse(e.message);
        if (eJson.status_code === CHAIN_STATUS_CODE.ILLEGAL_CID) {
          await dbOps.updateStatus(record.id, 'failed');
        } else {
          await dbOps.increaseTryout(record.id);
        }
      }
      logger.error(`unexpected exception occurs, error message:${e}`);
    }
  }
}

export async function createOrderTask(
  context: AppContext
): Promise<Task> {
  const orderInterval = 5 * 1000;
  return makeIntervalTask(
    orderInterval,
    orderInterval,
    'place-order',
    context,
    handleOrder,
  );
}
