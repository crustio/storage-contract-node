import Bluebird from 'bluebird';
import { AppContext } from "../types/context";
import { createAPI } from "./api-task";
import { createOrderTask } from "./order-task";
import { createPinTask } from "./pin-task";
import { createMonitorETHTask } from "./monitor-eth";
import { createMonitorElrondTask } from "./monitor-elrond";
import { createMonitorXStorageTask } from "./monitor-xstorage";
import {
  ETH_TASK_ENABLE,
  ELROND_TASK_ENABLE,
  XSTORAGE_TASK_ENABLE,
} from "../consts";

export function loadTasks(context: AppContext) {
  let tasks = [
    createAPI,
    createOrderTask,
    //createPinTask,
    ETH_TASK_ENABLE ? createMonitorETHTask : null,
    ELROND_TASK_ENABLE ? createMonitorElrondTask : null,
    XSTORAGE_TASK_ENABLE ? createMonitorXStorageTask : null,
  ];
  tasks = tasks.filter(n => n !== null );
  return Bluebird.mapSeries(tasks, (t: any) => {
    return t(context);
  });
}
