import { Database } from 'sqlite';
import { logger } from '../utils/logger';
import { formatError } from '../utils';
import { TRYOUT } from '../consts';
import {
  FileStatus,
  Record,
  ElrondTimestamp,
  DbOperator,
} from '../types/database';

export function createRecordOperator(db: Database): DbOperator {
  const addRecord = async (
    cid: string,
    size: number,
    token: string,
    price: string,
    blockNumber: number,
    chainType: string,
    txHash: string,
    timestamp: number,
  ): Promise<void> => {
    try {
      await db.run(
        'insert into record ' +
          '(`cid`, `size`, `token`, `price`, `blockNumber`, `chainType`, `txHash`, `timestamp`, `tryout`, `status`)' +
          ' values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          cid,
          size,
          token,
          price,
          blockNumber,
          chainType,
          txHash,
          timestamp,
          0,
          'new',
        ],
      );
    } catch(e) {
      const err_code = JSON.parse(JSON.stringify(e)).code;
      if (err_code !== 'SQLITE_CONSTRAINT') {
        throw e;
      }
    }
  };

  const getNewRecord = async (): Promise<Record[]> => {
    const records = await db.all(
      'select id, cid, size, blockNumber, txHash, status from record where status = ? and tryout < ? order by timestamp asc',
      ["new", TRYOUT],
    );
    return records;
  };

  const getOrderedRecord = async (): Promise<Record[]> => {
    const records = await db.all(
      'select id, cid, size, blockNumber, txHash, status from record where status = ? and tryout < ? order by timestamp asc',
      ["ordered", TRYOUT],
    );
    return records;
  };

  const getElrondLatestTimestamp = async (): Promise<number> => {
    const records = await db.all(
      'select id, blockNumber from record where chainType = ? order by blockNumber desc',
      ["elrond"],
    );
    if (records.length > 0) {
      return records[0].blockNumber + 1;
    }
    return 0;
  };

  const updateStatus = async (
    id: number,
    status: FileStatus
  ): Promise<void> => {
    await db.run(
      `update record set status = ? where id = ? `,
      [status, id],
    );
  };

  const increaseTryout = async (id: number): Promise<void> => {
    await db.run(
      `update record set tryout = tryout + 1 where id = ?`,
      [id],
    )
  }

  return {
    addRecord,
    getNewRecord,
    getOrderedRecord,
    getElrondLatestTimestamp,
    updateStatus,
    increaseTryout,
  };
}
