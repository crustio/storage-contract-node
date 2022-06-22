import urlJoin from 'url-join';
import { AppContext } from '../types/context';
import { httpGet, getTimestamp } from '../utils';
import { logger } from '../utils/logger';
import { createRecordOperator } from '../db/operator';
import { makeIntervalTask } from '../tasks/task-utils';
import { SHADOW_SUBSCAN_URL } from '../consts';

import fetch from 'node-fetch';

const fetchStep = 500000;

async function doFetch(data: any) {
  return fetch(
    `${SHADOW_SUBSCAN_URL}/api/scan/extrinsics`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );
}

async function fetchOrder(latestBlk: number) {
  try {
    let postData = {
      "row": 50,
      "page": 0,
      "signed": "signed",
      "address": "",
      "module": "xstorage",
      "call": "place_storage_order",
      "block_range": latestBlk === 0 ? "" : `${latestBlk}-${latestBlk+fetchStep}`,
    };
    const res = await doFetch(postData);
    if (res.status !== 200) {
      return [];
    }

    // Get order successfully
    const resJson = await res.json();
    if (resJson.data.count !== 0) {
      return resJson.data.extrinsics;
    }

    // Try to get order from current block to latest block
    const metaRes = await fetch(
      `${SHADOW_SUBSCAN_URL}/api/scan/metadata`
    );
    if (metaRes.status !== 0) {
      return [];
    }

    const metaJson = await metaRes.json();
    const lastBlk = metaJson.data.blockNum;
    let startBlk = latestBlk + fetchStep;

    // Return if current block is the latest
    if (startBlk >= lastBlk) {
      return [];
    }

    // Get transaction
    let endBlk = startBlk;
    while (endBlk < lastBlk) {
      endBlk += fetchStep;
      if (endBlk > lastBlk) {
        endBlk = lastBlk;
      }
      postData.block_range = `${startBlk}-${endBlk}`;
      const sRes = await doFetch(postData);
      if (sRes.status !== 200) {
        return [];
      }
      const sJson = await sRes.json();
      if (sJson.data.count !== 0) {
        return sJson.data.extrinsics;
      }
      startBlk = endBlk;
    }

    return [];
  } catch (e: any) {
    logger.error(`Get xstorage data failed, error message:${e}`);
  }
}

async function handleXStorage(context: AppContext): Promise<void> {
  const dbOps = createRecordOperator(context.database);
  const latestBlk = await dbOps.getXStorageLatestBlkNum();
  for (const event of await fetchOrder(latestBlk)) {
    const params = JSON.parse(event.params);
    dbOps.addRecord(
      event.account_id,
      event.account_id,
      params[0].value,
      params[1].value,
      'CRU',
      '0',
      event.block_num,
      "xstorage",
      event.extrinsic_hash,
      getTimestamp(),
    );
  }
}

export async function createMonitorXStorageTask(context: AppContext) {
  const xstorageInterval = 3 * 1000;
  return makeIntervalTask(
    xstorageInterval,
    xstorageInterval,
    'monitor-xstorage',
    context,
    handleXStorage,
  );
}
