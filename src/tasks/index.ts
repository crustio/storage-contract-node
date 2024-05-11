import Bluebird from 'bluebird';
import { AppContext } from "../types/context";
import { createAPI } from "./api-task";
import { createOrderTask } from "./order-task";
import { createPinTask } from "./pin-task";
import { createMonitorETHTask } from "./monitor-ethereum";
import { createMonitorARB1Task } from "./monitor-arb1";
import { createMonitorOPTask } from "./monitor-optimism";
import { createMonitorZksyncTask } from "./monitor-zksync";
//import { createMonitorStarknetTask } from "./monitor-starknet";
//import { createMonitorPolygonZKTask } from "./monitor-polygonzk";
import { createMonitorPOLYGONTask } from "./monitor-polygon";
import { createMonitorElrondTask } from "./monitor-elrond";
import { createMonitorXStorageTask } from "./monitor-xstorage";
import { createMonitorAptosTask } from "./monitor-aptos";
import { createMonitorAlgorandTask } from "./monitor-algorand";
import * as config from "../consts";
import {createMonitorBaseTask} from "./monitor-base";
import {createMonitorBlastTask} from "./monitor-blast";
import {createMonitorParaChainTask} from "./monitor-parachain";

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
    //config.STARKNET_TASK_ENABLE ? createMonitorStarknetTask : null,
    //config.POLYGONZK_TASK_ENABLE ? createMonitorPolygonZKTask : null,
    config.POLYGON_TASK_ENABLE ? createMonitorPOLYGONTask : null,
    config.ELROND_TASK_ENABLE ? createMonitorElrondTask : null,
    config.XSTORAGE_TASK_ENABLE ? createMonitorXStorageTask : null,
    config.APTOS_TASK_ENABLE ? createMonitorAptosTask : null,
    config.ALGO_TASK_ENABLE ? createMonitorAlgorandTask : null,
    config.BASE_TASK_ENABLE ? createMonitorBaseTask : null,
    config.BLAST_TASK_ENABLE ? createMonitorBlastTask : null,
    config.PARA_CHAIN_TASK_ENABLE ? createMonitorParaChainTask : null,
  ];
  tasks = tasks.filter(n => n !== null );
  return Bluebird.mapSeries(tasks, (t: any) => {
    return t(context);
  });
}
