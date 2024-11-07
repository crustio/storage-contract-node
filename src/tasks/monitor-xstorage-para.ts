import { logger } from '../utils/logger';
import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { makeIntervalTask } from '../tasks/task-utils';
import { ParachainApi } from '../chain/parachain';

const parachainApi = new ParachainApi();

async function handleXStoragePara(
  context: AppContext
): Promise<void> {
  const subscribeFinalized = await parachainApi.getXStorageHandler(context);
  await subscribeFinalized();
}

export async function createMonitorXStorageParaTask(
  context: AppContext
): Promise<Task> {
  const xstorageInterval = 15 * 1000;
  return makeIntervalTask(
    xstorageInterval,
    xstorageInterval,
    'monitor-xstorage-para',
    context,
    handleXStoragePara,
  );
}
