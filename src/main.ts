import Bluebird from 'bluebird';
import { loadTasks } from "./tasks";
import { AppContext } from "./types/context";
import _ from 'lodash';
import { loadDb } from "./db";
import { Task } from './types/tasks';
import MainnetApi from "./chain";
import IpfsApi from "./ipfs";
import { Dayjs } from './utils/datetime';
import { logger } from './utils/logger';
import { timeout, timeoutOrError } from "./utils/promise-utils";

const MaxTickTimout = 15 * 1000;
const MaxNoNewBlockDuration = Dayjs.duration({
  minutes: 30,
});

async function main() {
  const db = await loadDb();
  const mainnetApi: MainnetApi = await startCrustChain()
  const ipfsApi: IpfsApi = await startIPFS();

  const context :AppContext = {
    database: db,
    mainnetApi: mainnetApi,
    ipfsApi: ipfsApi,
  };

  const tasks = await loadTasks(context)

  try {
    _.forEach(tasks, (t: any) => t.start(context));
    await doEventLoop(context, tasks);
  } catch(e) {
    logger.error(`unexpected error occurs, message:${e}`);
    throw e;
  } finally {
    await timeout(db.close(), 5 * 1000, null);
    mainnetApi.stop();
    logger.info('stopping tasks');
    await timeout(
      Bluebird.map(tasks, (t: any) => t.stop()),
      5 * 1000,
      [],
    );
  }
}

async function startCrustChain() {
  const mainnetApi: MainnetApi = new MainnetApi();
  await mainnetApi.initApi();
  return mainnetApi;
}

async function startIPFS() {
  const ipfsApi: IpfsApi = new IpfsApi();
  await ipfsApi.startIPFS();
  return ipfsApi;
}

async function doEventLoop(context: AppContext, tasks: Task[]): Promise<void> {
  const { mainnetApi } = context;
  let lastBlock = await mainnetApi.latestFinalizedBlock();
  let lastBlockTime = Dayjs();
  logger.info('running event loop');
  do {
    const curBlock = await mainnetApi.latestFinalizedBlock();
    if (lastBlock >= curBlock) {
      const now = Dayjs();
      const diff = Dayjs.duration(now.diff(lastBlockTime));
      if (diff.asSeconds() > MaxNoNewBlockDuration.asSeconds()) {
        logger.error(
          'no new block for %d seconds, quiting smanager!',
          diff.asSeconds(),
        );
        throw new Error('block not updating');
      }
      await Bluebird.delay(3 * 1000);
      continue;
    }
    await Bluebird.delay(10 * 1000);
  } while (true); // eslint-disable-line
}

main()
  .catch((e: any) => {
    logger.error(e.message);
    process.exit(1);
  })
