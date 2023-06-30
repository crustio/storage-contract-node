import { ShadowApi } from '../chain/shadow';
import { logger } from '../utils/logger';
import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { makeIntervalTask } from '../tasks/task-utils';
import { SHADOW_ENDPOINT_URL } from '../consts';

const shadowApi = new ShadowApi();

async function handleXStorage(
  context: AppContext
): Promise<void> {
  if (SHADOW_ENDPOINT_URL === '') {
    logger.error("Monitor chain address cannot be null!");
    return;
  }

  const subscribeFinalized = await shadowApi.getXStorageHandler(context);

  await subscribeFinalized();
}

export async function createMonitorXStorageTask(
  context: AppContext
): Promise<Task> {
  const xstorageInterval = 15 * 1000;
  return makeIntervalTask(
    xstorageInterval,
    xstorageInterval,
    'monitor-xstorage',
    context,
    handleXStorage,
  );
}
