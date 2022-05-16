import Bluebird from 'bluebird';
import { AppContext } from "../types/context";
import { createAPI } from "./api-task";
import { createOrderTask } from "./order-task";
import { createPinTask } from "./pin-task";
import { createMonitorETHTask } from "./monitor-eth";
import { createMonitorElrondTask } from "./monitor-elrond";

export function loadTasks(context: AppContext) {
  const tasks = [
    createAPI,
    createOrderTask,
    //createPinTask,
    createMonitorETHTask,
    createMonitorElrondTask,
  ];
  return Bluebird.mapSeries(tasks, (t: any) => {
    return t(context);
  });
}
