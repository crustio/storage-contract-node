import Bluebird from 'bluebird';
import { AppContext } from "../types/context";
import { createAPI } from "./api-task";
import { createOrderTask } from "./order-task";
import { createPinTask } from "./pin-task";
import { createMonitorETHTask } from "./monitor-ethereum";
import { createMonitorARB1Task } from "./monitor-arb1";
import { createMonitorOPTask } from "./monitor-optimism";
import { createMonitorZksyncTask } from "./monitor-zksync";
import { createMonitorStarknetTask } from "./monitor-starknet";
import { createMonitorPOLYGONTask } from "./monitor-polygon";
import { createMonitorElrondTask } from "./monitor-elrond";
import { createMonitorXStorageTask } from "./monitor-xstorage";
import { createMonitorAptosTask } from "./monitor-aptos";
import * as config from "../consts";

export function loadTasks(
  context: AppContext
) {
  let tasks = [
    createAPI,
    createOrderTask,
    //createPinTask,
    config.ETH_TASK_ENABLE ? createMonitorETHTask : null,
    config.ARB1_TASK_ENABLE ? createMonitorARB1Task : null,
    config.OP_TASK_ENABLE ? createMonitorOPTask : null,
    config.ZKSYNC_TASK_ENABLE ? createMonitorZksyncTask : null,
    config.STARKNET_TASK_ENABLE ? createMonitorStarknetTask : null,
    config.POLYGON_TASK_ENABLE ? createMonitorPOLYGONTask : null,
    config.ELROND_TASK_ENABLE ? createMonitorElrondTask : null,
    config.XSTORAGE_TASK_ENABLE ? createMonitorXStorageTask : null,
    config.APTOS_TASK_ENABLE ? createMonitorAptosTask : null,
  ];
  tasks = tasks.filter(n => n !== null );
  return Bluebird.mapSeries(tasks, (t: any) => {
    return t(context);
  });
}
