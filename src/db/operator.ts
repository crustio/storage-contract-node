import Chain from '../chain';
import { Database } from 'sqlite';
import { formatError } from '../utils';
import * as config from '../consts';
import { logger } from '../utils/logger';
import { getEVMLatestBlkNum } from '../tasks/task-utils';
import {
  FileStatus,
  Record,
  RecordShow,
  ElrondTimestamp,
  DbOperator,
} from '../types/database';

export function createRecordOperator(db: Database): DbOperator {
  const addRecord = async (
    customer: string,
    merchant: string,
    cid: string,
    size: number,
    token: string,
    price: string,
    blockNumber: number,
    chainType: string,
    isPermanent: boolean,
    txHash: string,
    timestamp: number,
  ): Promise<void> => {
    try {
      await db.run(
        'insert into record ' +
          '(`customer`, `merchant`, `cid`, `size`, `token`, `price`, `blockNumber`, `chainType`, `isPermanent`, `txHash`, `timestamp`, `tryout`, `status`)' +
          ' values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          customer,
          merchant,
          cid,
          size,
          token,
          price,
          blockNumber,
          chainType,
          isPermanent,
          txHash,
          timestamp,
          0,
          'new',
        ],
      );

      logger.info(`Add ${chainType} task successfully.`);
      logger.info(`  customer:${customer}`);
      logger.info(`  merchant:${merchant}`);
      logger.info(`  cid:${cid}`);
      logger.info(`  size:${size}`);
      logger.info(`  token:${token}`);
      logger.info(`  price:${price}`);
      logger.info(`  blockNumber:${blockNumber}`);
      logger.info(`  isPermanent:${isPermanent}`);
      logger.info(`  txHash:${txHash}`);
      logger.info(`  timestamp:${timestamp}`);
    } catch(e) {
      const err_code = JSON.parse(JSON.stringify(e)).code;
      if (err_code !== 'SQLITE_CONSTRAINT') {
        throw e;
      }
    }
  };

  const getRecordByType = async (
    status: string,
    chainType: string,
  ): Promise<RecordShow[]> => {
    let params: string[] = []; 
    status === '' || params.push(`status = '${status}'`);
    chainType === '' || params.push(`chainType = '${chainType}'`);
    let where = "";
    if (params.length > 0) {
      where = `where ${params.join(' and ')}`;
    }
    const records = await db.all(
      `select customer, merchant, cid, size, token, price, blockNumber, chainType, isPermanent, txHash, timestamp, status from record ${where} order by timestamp asc`,
      [],
    );
    return records;
  };

  const getNewRecord = async (): Promise<Record[]> => {
    const records = await db.all(
      'select id, cid, size, chainType, txHash, blockNumber, isPermanent, txHash, status from record where status = ? and tryout < ? order by timestamp asc',
      ["new", config.TRYOUT],
    );
    return records;
  };

  const getOrderedRecord = async (): Promise<Record[]> => {
    const records = await db.all(
      'select id, cid, size, blockNumber, isPermanent, txHash, status from record where status = ? and tryout < ? order by timestamp asc',
      ["ordered", config.TRYOUT],
    );
    return records;
  };

  const setMonitorBlkNum = async (
    blockNumber: number,
    chainType: string
  ): Promise<void> => {
    await db.run(
      'insert or replace into monitor ' + '(`blockNumber`, `chainType`)' + ' values (?, ?)',
      [blockNumber, chainType]
    );
  }

  const getMonitorBlkNum = async (chainType: string): Promise<number> => {
    const records = await db.all(
      'select blockNumber from monitor where chainType = ?',
      [chainType],
    );
    if (records.length > 0) {
      return records[0].blockNumber;
    }
    return -1;
  }

  const getElrondLatestTimestamp = async (): Promise<number> => {
    const records = await db.all(
      'select id, blockNumber from record where chainType = ? order by blockNumber desc',
      ["elrond"],
    );
    if (records.length > 0) {
      return records[0].blockNumber;
    }
    return 0;
  };

  const getXStorageLatestBlkNum = async (): Promise<number> => {
    const records = await db.all(
      'select id, blockNumber from record where chainType = ? order by blockNumber desc',
      ["xstorage"],
    );
    if (records.length > 0) {
      return records[0].blockNumber;
    }
    return 0;
  };

  const getXStorageParaLatestBlkNum = async (): Promise<number> => {
    const records = await db.all(
      'select id, blockNumber from record where chainType = ? order by blockNumber desc limit 1',
      ["xstorage-para"],
    );
    if (records.length > 0) {
      return records[0].blockNumber;
    }
    return 0;
  };

  const getARB1LatestBlkNum = async (): Promise<number> => {
    const records = await db.all(
      'select id, blockNumber from record where chainType = ? order by blockNumber desc',
      ["arb1"],
    );
    if (records.length > 0) {
      return records[0].blockNumber;
    }
    return 0;
  };

  const getAptosStartSequenceNumber = async (): Promise<number> => {
    const records = await db.all(
      'select id, blockNumber from record where chainType = ? order by blockNumber desc',
      ["aptos"],
    );
    if (records.length > 0) {
      return records[0].blockNumber + 1;
    }
    return 0;
  };

  const syncToLatestBlock = async (): Promise<any> => {
    if (config.EVMChain2RPC.size === 0) 
      return "{}";

    let ans = "{"
    for (const [key,value] of config.EVMChain2RPC) {
      const curBlkNum = await getEVMLatestBlkNum(value);
      await db.run(
        `update monitor set blockNumber = ? where chainType = ?`,
        [curBlkNum, key],
      );
      ans += `"${key}":"${curBlkNum}",`
      logger.info(`Update ${key} sync block number to ${curBlkNum}`);
    }
    return JSON.parse(ans.substr(0,ans.length-1) + "}");
  };

  const updateStatus = async (
    id: number,
    status: FileStatus,
  ): Promise<void> => {
    await db.run(
      `update record set status = ? where id = ? `,
      [status, id],
    );
  };

  const increaseTryout = async (id: number, step = 1): Promise<void> => {
    await db.run(
      `update record set tryout = tryout + ?, status = CASE WHEN tryout + ? >= ? THEN 'tryout' ELSE 'new' END where id = ?`,
      [step, step, config.TRYOUT, id],
    )
  }

  const deleteByHash = async (hash: string): Promise<void> => {
    await db.run(
      `delete from record where txHash = ?`,
      [hash],
    )
  }

  return {
    addRecord,
    setMonitorBlkNum,
    getRecordByType,
    getNewRecord,
    getOrderedRecord,
    getElrondLatestTimestamp,
    getXStorageLatestBlkNum,
    getXStorageParaLatestBlkNum,
    getARB1LatestBlkNum,
    getAptosStartSequenceNumber,
    getMonitorBlkNum,
    syncToLatestBlock,
    updateStatus,
    increaseTryout,
    deleteByHash,
  };
}
