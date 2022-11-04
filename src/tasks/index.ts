import Bluebird from 'bluebird';
import { AppContext } from "../types/context";
import { createAPI } from "./api-task";
import { createOrderTask } from "./order-task";
import { createPinTask } from "./pin-task";
import { createMonitorETHTask } from "./monitor-eth";
import { createMonitorPOLYGONTask } from "./monitor-polygon";
import { createMonitorARB1Task } from "./monitor-arb1";
import { createMonitorElrondTask } from "./monitor-elrond";
import { createMonitorXStorageTask } from "./monitor-xstorage";
import { createMonitorAptosTask } from "./monitor-aptos";
import {
  ETH_TASK_ENABLE,
  POLYGON_TASK_ENABLE,
  ARB1_TASK_ENABLE,
  ELROND_TASK_ENABLE,
  XSTORAGE_TASK_ENABLE,
  APTOS_TASK_ENABLE,
} from "../consts";

export function loadTasks(context: AppContext) {
  let tasks = [
    createAPI,
    createOrderTask,
    //createPinTask,
    ETH_TASK_ENABLE ? createMonitorETHTask : null,
    POLYGON_TASK_ENABLE ? createMonitorPOLYGONTask : null,
    ARB1_TASK_ENABLE ? createMonitorARB1Task : null,
    ELROND_TASK_ENABLE ? createMonitorElrondTask : null,
    XSTORAGE_TASK_ENABLE ? createMonitorXStorageTask : null,
    APTOS_TASK_ENABLE ? createMonitorAptosTask : null,
  ];
  tasks = tasks.filter(n => n !== null );
  return Bluebird.mapSeries(tasks, (t: any) => {
    return t(context);
  });
}
