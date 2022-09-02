import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { Keyring } from '@polkadot/keyring';
import { logger } from './logger';
import dayjs from 'dayjs';

const axios = require('axios');
const axiosInstance = axios.create();

export function httpGet(url: string) {
  return axiosInstance.get(url, {
    responseType: 'arrayBuffer'
  })
}

/**
 * sleep
 * @param {number} microsec 
 * @returns promise
 */
export function sleep(microsec: number) {
  return new Promise(resolve => setTimeout(resolve, microsec))
}

/**
 * Check CIDv0 legality
 * @param {string} cid 
 * @returns boolean
 */
export function checkCid(cid: string) {
  return (cid.length === 46 && cid.substr(0, 2) === 'Qm') || (cid.length === 59 && cid.substr(0, 2) === 'ba');
}

/**
 * Check seeds(12 words) legality
 * @param {string} seeds 
 * @returns boolean
 */
export function checkSeeds(seeds: string) {
  return seeds.split(' ').length === 12;
}

/**
 * Send tx to Crust Network
 * @param {import('@polkadot/api/types').SubmittableExtrinsic} tx
 * @param {string} seeds 12 secret words 
 * @returns Promise<boolean> send tx success or failed
 */
export async function sendTx(tx: SubmittableExtrinsic, seeds: string) {
  // 1. Load keyring
  logger.info('⛓  Sending tx to chain...');
  const krp = loadKeyringPair(seeds);
    
  // 2. Send tx to chain
  return new Promise((resolve, reject) => {
    tx.signAndSend(krp, ({events = [], status}) => {
      logger.info(
          `  ↪ 💸  Transaction status: ${status.type}, nonce: ${tx.nonce}`
      );

      if (
        status.isInvalid ||
        status.isDropped ||
        status.isUsurped ||
        status.isRetracted
      ) {
        reject(new Error('Invalid transaction'));
      } else {
        // Pass it
      }

      if (status.isInBlock) {
        events.forEach(({event: {method, section}}) => {
          if (section === 'system' && method === 'ExtrinsicFailed') {
            // Error with no detail, just return error
            logger.error('  ↪ ❌  Send transaction failed');
            resolve(false);
          } else if (method === 'ExtrinsicSuccess') {
            logger.info('  ↪ ✅  Send transaction success.');
            resolve(true);
          }
        });
      } else {
        // Pass it
      }
    }).catch((e: any) => {
      reject(e);
    });
  }).catch((e: any) => {});
}

/* PRIVATE METHODS  */
/**
 * Load keyring pair with seeds
 * @param {string} seeds 
 */
function loadKeyringPair(seeds: string) {
  const kr = new Keyring({
      type: 'sr25519',
  });

  const krp = kr.addFromUri(seeds);
  return krp;
}

// eslint-disable-next-line
export function formatError(e: any): string {
  return (e as Error).stack || JSON.stringify(e);
}

export function getTimestamp(): number {
  return dayjs().unix();
}
