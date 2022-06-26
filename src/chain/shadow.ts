import { ApiPromise, WsProvider } from '@polkadot/api';
import { logger } from '../utils/logger';
import { getTimestamp, formatError } from '../utils';
import { SHADOW_ENDPOINT_URL } from '../consts';
import { AppContext } from '../types/context';
import { createRecordOperator } from '../db/operator';
import { typesBundleForPolkadot } from '@crustio/type-definitions';
import { Header} from '@polkadot/types/interfaces';
import { VoidFn } from '@polkadot/api/types';
import Bluebird from 'bluebird';

export class ShadowApi {
  private api: any = null;
  private subscribeFinalized: VoidFn = () => {};
  private currentBlock = 821850;

  async initApi(ctx: AppContext) {
    this.api = new ApiPromise({
      provider: new WsProvider(SHADOW_ENDPOINT_URL),
      typesBundle: typesBundleForPolkadot,
    });
    await this.api.isReadyOrError;

    this.subscribeFinalized = await this.api.rpc.chain.subscribeFinalizedHeads(
      (head: Header) => {
        this.handleHeader(ctx, head);
      },
    );
  }

  async getXStorageHandler(ctx: AppContext): Promise<VoidFn> {
    if (this.api === null) {
      this.initApi(ctx);
    }

    await this.ensureConnection(ctx);

    return this.subscribeFinalized;
  }

  async handleHeader(ctx: AppContext, b: Header) {
    const chainBn = b.number.toNumber();
    //logger.info(`Subscribe initialized number ${chainBn}`)
    if (this.currentBlock < chainBn) {
      let tmpBN = this.currentBlock;
      this.currentBlock = chainBn
      for (let bn = tmpBN; bn < this.currentBlock; bn++) {
        await this.handleXSBlock(ctx, bn)
      }
    }
  }

  async handleXSBlock(ctx: AppContext, bn: number) {
    const dbOps = createRecordOperator(ctx.database);
    const bhash = await this.api.rpc.chain.getBlockHash(bn);
    const [events] = await this.blockWithEvent(bhash);
    // @ts-ignore
    const resEvents: EventRecord[] = events;
    for (const event of resEvents) {
      if (event.event.isXstorage && event.event.asXstorage.isFileSuccess) {
        const eJson = JSON.parse(JSON.stringify(event.event.asXstorage.asFileSuccess));
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
          bhash.toString(),
          getTimestamp(),
        );
      }
    }
  }

  private async blockWithEvent(bhash: any) {
    return Promise
      .all([
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
