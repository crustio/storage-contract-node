import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundleForPolkadot, types } from '@crustio/type-definitions';
import { checkCid, checkSeeds, sendTx, formatError, sleep } from '../utils';
import { CRUST_CHAIN_URL, CRUST_SEEDS } from '../consts'
import { logger } from '../utils/logger';
import { Header } from '@polkadot/types/interfaces';
import Bluebird from 'bluebird';

export const CHAIN_STATUS_CODE = {
  SUCCESS: 200,
  ILLEGAL_CID: 400,
  ILLEGAL_SEEDS: 401,
  PLACE_ORDER_FAILED: 402,
};

export default class MainnetApi {
  private api: any;
  private latestBlock = 0;

  async initApi() {
    // Try to connect to Crust Chain
    this.api = new ApiPromise({
      provider: new WsProvider(CRUST_CHAIN_URL),
      typesBundle: typesBundleForPolkadot
    });
    await this.api.isReadyOrError;
  }

  stop() {
    this.api.disconnect();
  }

  async latestFinalizedBlock(): Promise<number> {
    await this.api.rpc.chain.subscribeFinalizedHeads(
      (head: Header) => {
        this.latestBlock = head.number.toNumber();
      },
    );
    return this.latestBlock;
  }

  private async ensureConnection(): Promise<void> {
    if (!(await this.withApiReady())) {
      logger.info('⛓ Connection broken, waiting for chain running.');
      await Bluebird.delay(6000); // IMPORTANT: Sequential matters(need give time for create ApiPromise)
      await this.initApi(); // Try to recreate api to connect running chain
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

  async order(cid: string, size: number) {
    await this.ensureConnection();

    // Check cid and seeds
    if (!checkCid(cid)) {
      throw new Error(JSON.stringify({
        status_code: CHAIN_STATUS_CODE.ILLEGAL_CID,
        message: `Illegal cid:'${cid}'`,
      }));
    }

    if (!checkSeeds(CRUST_SEEDS)) {
      throw new Error(JSON.stringify({
        status_code: CHAIN_STATUS_CODE.ILLEGAL_SEEDS,
        message: 'Illegal seeds',
      }));
    }

    // Construct tx
    let txRes: any;
    let tryout = 0;
    while (tryout++ < 10) {
      const tx = this.api.tx.market.placeStorageOrder(cid, size, 0, '');

      // Send tx and disconnect chain
      try {
        txRes = await sendTx(tx, CRUST_SEEDS);
      } catch(e: any) {
        logger.error('Send transaction failed');
      }

      if (txRes)
        break;

      //logger.info(`Send tx cid:${cid} failed, try again...${tryout}`)
      await sleep(3000);
    }

    if (!txRes) {
      throw new Error(JSON.stringify({
        status_code: CHAIN_STATUS_CODE.PLACE_ORDER_FAILED,
        message: `Place order cid:${cid} failed`,
      }));
    }
  }
}
