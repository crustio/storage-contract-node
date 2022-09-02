import { ApiPromise, WsProvider } from '@polkadot/api';
import { logger } from '../utils/logger';
import { getTimestamp, formatError } from '../utils';
import { SHADOW_ENDPOINT_URL } from '../consts';
import { AppContext } from '../types/context';
import { createRecordOperator } from '../db/operator';
import { typesBundleForPolkadot } from '@crustio/type-definitions';
import { EventRecord, Extrinsic, Header } from '@polkadot/types/interfaces';
import { VoidFn } from '@polkadot/api/types';
import Bluebird from 'bluebird';

const STARTBN = 821850;

export class ShadowApi {
  private api: any = null;
  private subscribeFinalized: VoidFn = () => {};
  private latestBlkNum = 0;

  async initApi(ctx: AppContext) {
    this.api = new ApiPromise({
      provider: new WsProvider(SHADOW_ENDPOINT_URL),
      typesBundle: typesBundleForPolkadot,
    });
    await this.api.isReadyOrError;
  }

  async getXStorageHandler(ctx: AppContext): Promise<VoidFn> {
    if (this.api === null) {
      this.initApi(ctx);
    }

    await this.ensureConnection(ctx);

    this.subscribeFinalized = await this.api.rpc.chain.subscribeFinalizedHeads(
      (head: Header) => {
        this.handleHeader(ctx, head);
      },
    );

    return this.subscribeFinalized;
  }

  async handleHeader(ctx: AppContext, b: Header) {
    if (this.latestBlkNum === 0) {
      const dbOps = createRecordOperator(ctx.database);
      const tmpBn = await dbOps.getXStorageLatestBlkNum();
      this.latestBlkNum = Math.max(tmpBn, STARTBN);
    }

    const chainBn = b.number.toNumber();
    //logger.info(`Subscribe initialized number ${chainBn}`)
    if (this.latestBlkNum < chainBn) {
      const startBn = this.latestBlkNum;
      this.latestBlkNum = chainBn;
      for (let bn = startBn; bn < this.latestBlkNum; bn++) {
        await this.handleXSBlock(ctx, bn)
      }
    }
  }

  async handleXSBlock(ctx: AppContext, bn: number) {
    const dbOps = createRecordOperator(ctx.database);
    const [blocks, events] = await this.blockWithEvent(bn);
    const txs: Extrinsic[] = blocks?.block?.extrinsics;
    for (const [index, tx] of new Map(txs.map((item, i) => [i, item]))) {
      for (const { event, phase } of events) {
        if (phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index) 
            && event.isXstorage && event.asXstorage.isFileSuccess) {
          const eJson = JSON.parse(JSON.stringify(event.asXstorage.asFileSuccess));
          const account = eJson.account;
          const cid = Buffer.from(eJson.cid.substr(2), 'hex').toString();
          const size = eJson.size;
          dbOps.addRecord(
            account,
            account,
            cid,
            size,
            'CRU',
            '0',
            bn,
            "xstorage",
            tx.hash.toHex(),
            getTimestamp(),
          );
        }
      }
    }
  }

  private async blockWithEvent(bn: number) {
    const bhash = await this.api.rpc.chain.getBlockHash(bn);
    return Promise
      .all([
        this.api.rpc.chain.getBlock(bhash),
        this.api.query.system.events.at(bhash),
    ])
  }

  private async ensureConnection(ctx: AppContext): Promise<void> {
    if (!(await this.withApiReady())) {
      logger.info('⛓ Connection broken, waiting for chain running.');
      await Bluebird.delay(6000); // IMPORTANT: Sequential matters(need give time for create ApiPromise)
      await this.initApi(ctx); // Try to recreate api to connect running chain
    }
  }

  private async withApiReady(): Promise<boolean> {
    try {
      await this.api.isReadyOrError;
      return true;
    } catch (e) {
      logger.error(`💥 Error connecting with Chain: %s`, formatError(e));
      return false;
    }
  }

}
