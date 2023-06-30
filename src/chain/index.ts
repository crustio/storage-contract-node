import { ApiPromise, WsProvider } from '@polkadot/api';
import { compactToU8a } from '@polkadot/util';
import { typesBundleForPolkadot, types } from '@crustio/type-definitions';
import { checkCid, checkSeeds, sendTxRetry, formatError, sleep } from '../utils';
import { CRUST_CHAIN_URL, CRUST_SEEDS } from '../consts'
import { logger } from '../utils/logger';
import { Header } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import BN from 'bn.js';
import Bluebird from 'bluebird';

export const CHAIN_STATUS_CODE = {
  SUCCESS: 200,
  ILLEGAL_CID: 400,
  ILLEGAL_SEEDS: 401,
  PLACE_ORDER_FAILED: 402,
  ADD_PREPAID_FAILED: 403,
};

export default class MainnetApi {
  private api: any;
  private latestBlock = 0;
  private fileByteFee = new BN(0);
  private fileBaseFee = new BN(0);
  private fileKeysCountFee = new BN(0);

  async initApi() {
    // Try to connect to Crust Chain
    this.api = new ApiPromise({
      provider: new WsProvider(CRUST_CHAIN_URL),
      typesBundle: typesBundleForPolkadot
    });
    await this.api.isReadyOrError;
    this.fileByteFee = new BN(await this.api.query.market.fileByteFee());
    this.fileBaseFee = new BN(await this.api.query.market.fileBaseFee());
    this.fileKeysCountFee = new BN(await this.api.query.market.fileKeysCountFee());
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

  getPrice(size: number, years: number) {
    return this.fileByteFee
      .mul(new BN(size))
      .divn(1024*1024)
      .add(this.fileBaseFee)
      .add(this.fileKeysCountFee)
      .mul(new BN(years*2));
  }

  async order(
    cid: string, 
    size: number, 
    txHash: string, 
    chainType: string, 
    isPermanent: boolean = false
  ) {
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

    // Send prepaid transaction
    if (isPermanent) {
      const price = this.getPrice(size, 100);
      const prepaidTx = this.api.tx.market.addPrepaid(cid, price);
      const prepaidTxRes = await sendTxRetry(prepaidTx, CRUST_SEEDS, 10);
      if (!prepaidTxRes) {
        throw new Error(JSON.stringify({
          status_code: CHAIN_STATUS_CODE.ADD_PREPAID_FAILED,
          message: `Add prepaid for cid:${cid} failed`,
        }));
      }
      logger.info(`Add prepaid:${price} to permanent storage for cid:${cid} successfully!`);
    }

    // Send place order transaction
    const placeOrderTx = this.api.tx.market.placeStorageOrder(cid, size, 0, `{"txHash":"${txHash}","chainType":"${chainType}"}`);
    const placeOrderTxRes = await sendTxRetry(placeOrderTx, CRUST_SEEDS, 10);
    if (!placeOrderTxRes) {
      throw new Error(JSON.stringify({
        status_code: CHAIN_STATUS_CODE.PLACE_ORDER_FAILED,
        message: `Place order cid:${cid} failed`,
      }));
    }
    logger.info(`Place order cid:${cid} successfully!`);
  }
}
