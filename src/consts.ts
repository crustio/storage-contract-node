import { ethers } from "ethers";
// Load env
// eslint-disable-next-line node/no-extraneous-require
require('dotenv').config();

const getParamOrExit = (name: string) => {
  const param = process.env[name];
  if (!param) {
    console.error(`Required config param '${name}' missing`);
    process.exit(1);
  }
  return param;
};

/**
 * @param {string} name
 * @param {boolean} enable if false not exit
 * @returns param or null
 */
const getParamOrExitExcept = (name: string, enable: boolean) => {
  const param = process.env[name];
  if (!param && enable) {
    console.error(`Required config param '${name}' missing`);
    process.exit(1);
  }
  return param ?? "";
}

const getParam = (name: string) => {
  const param = process.env[name];
  if (!param) {
    return null;
  }
  return param;
};

const getTopics = (tags: string[]) => {
  const res: string[] = [];
  for (const tag of tags) {
    res.push(ethers.utils.id(tag));
  }
  return res;
}

export enum EVMChainType {
  ETHEREUM = 'ethereum',
  ARB1 = 'arb1',
  OPTIMISM = 'optimism',
  ZKSYNC = 'zksync',
  STARKNET = 'starknet',
  POLYGONZK = 'polygonzk',
  POLYGON = 'polygon',
  BASE = 'base',
  BLAST = 'blast',
  U2U = 'u2u',
  PARA = 'para',
};

export const EVMChain2Token = new Map<string,string>([
  [EVMChainType.ETHEREUM, 'eth'],
  [EVMChainType.ARB1, 'eth'],
  [EVMChainType.OPTIMISM, 'eth'],
  [EVMChainType.ZKSYNC, 'eth'],
  [EVMChainType.STARKNET, 'eth'],
  [EVMChainType.POLYGONZK, 'eth'],
  [EVMChainType.POLYGON, 'matic'],
  [EVMChainType.BASE, 'eth'],
  [EVMChainType.BLAST, 'eth'],
  [EVMChainType.PARA, 'eth'],
  [EVMChainType.U2U, 'eth'],
]);

export const CRUST_SEEDS = getParamOrExit("CRUST_SEEDS");
export const CRUST_CHAIN_URL = getParamOrExit("CRUST_CHAIN_URL");
export const DB_PATH = getParamOrExit("DB_PATH");
export const API_PORT = parseInt(getParamOrExit("API_PORT"));

export const ETH_TASK_ENABLE = process.env.ETH_TASK_ENABLE as string !== 'false';
export const ETH_ACCOUNT = getParamOrExitExcept("ETH_ACCOUNT", ETH_TASK_ENABLE);
export const ETH_ENDPOINT_URL = getParamOrExitExcept("ETH_ENDPOINT_URL", ETH_TASK_ENABLE);
export const ETH_STORAGE_CONTRACT_ADDRESS = getParamOrExitExcept("ETH_STORAGE_CONTRACT_ADDRESS", ETH_TASK_ENABLE);

export const ARB1_TASK_ENABLE = process.env.ARB1_TASK_ENABLE as string !== 'false';
export const ARB1_ACCOUNT = getParamOrExitExcept("ARB1_ACCOUNT", ARB1_TASK_ENABLE);
export const ARB1_ENDPOINT_URL = getParamOrExitExcept("ARB1_ENDPOINT_URL", ARB1_TASK_ENABLE);
export const ARB1_STORAGE_CONTRACT_ADDRESS = getParamOrExitExcept("ARB1_STORAGE_CONTRACT_ADDRESS", ARB1_TASK_ENABLE);

export const OP_TASK_ENABLE = process.env.OP_TASK_ENABLE as string !== 'false';
export const OP_ACCOUNT = getParamOrExitExcept("OP_ACCOUNT", OP_TASK_ENABLE);
export const OP_ENDPOINT_URL = getParamOrExitExcept("OP_ENDPOINT_URL", OP_TASK_ENABLE);
export const OP_STORAGE_CONTRACT_ADDRESS = getParamOrExitExcept("OP_STORAGE_CONTRACT_ADDRESS", OP_TASK_ENABLE);

export const BASE_TASK_ENABLE = process.env.BASE_TASK_ENABLE as string !== 'false';
export const BASE_ACCOUNT = getParamOrExitExcept("BASE_ACCOUNT", BASE_TASK_ENABLE);
export const BASE_ENDPOINT_URL = getParamOrExitExcept("BASE_ENDPOINT_URL", BASE_TASK_ENABLE);
export const BASE_STORAGE_CONTRACT_ADDRESS = getParamOrExitExcept("BASE_STORAGE_CONTRACT_ADDRESS", BASE_TASK_ENABLE);

export const BLAST_TASK_ENABLE = process.env.BLAST_TASK_ENABLE as string !== 'false';
export const BLAST_ACCOUNT = getParamOrExitExcept("BLAST_ACCOUNT", BLAST_TASK_ENABLE);
export const BLAST_ENDPOINT_URL = getParamOrExitExcept("BLAST_ENDPOINT_URL", BLAST_TASK_ENABLE);
export const BLAST_STORAGE_CONTRACT_ADDRESS = getParamOrExitExcept("BLAST_STORAGE_CONTRACT_ADDRESS", BLAST_TASK_ENABLE);

export const U2U_TASK_ENABLE = process.env.U2U_TASK_ENABLE as string !== 'false';
export const U2U_ACCOUNT = getParamOrExitExcept("U2U_ACCOUNT", U2U_TASK_ENABLE);
export const U2U_ENDPOINT_URL = getParamOrExitExcept("U2U_ENDPOINT_URL", U2U_TASK_ENABLE);
export const U2U_STORAGE_CONTRACT_ADDRESS = getParamOrExitExcept("U2U_STORAGE_CONTRACT_ADDRESS", U2U_TASK_ENABLE);

export const PARA_CHAIN_TASK_ENABLE = process.env.PARA_CHAIN_TASK_ENABLE as string !== 'false';
export const PARA_CHAIN_ACCOUNT = getParamOrExitExcept("PARA_CHAIN_ACCOUNT", PARA_CHAIN_TASK_ENABLE);
export const PARA_CHAIN_ENDPOINT_URL = getParamOrExitExcept("PARA_CHAIN_ENDPOINT_URL", PARA_CHAIN_TASK_ENABLE);
export const PARA_CHAIN_STORAGE_CONTRACT_ADDRESS = getParamOrExitExcept("PARA_CHAIN_STORAGE_CONTRACT_ADDRESS", PARA_CHAIN_TASK_ENABLE);

export const ZKSYNC_TASK_ENABLE = process.env.ZKSYNC_TASK_ENABLE as string !== 'false';
export const ZKSYNC_ACCOUNT = getParamOrExitExcept("ZKSYNC_ACCOUNT", ZKSYNC_TASK_ENABLE);
export const ZKSYNC_ENDPOINT_URL = getParamOrExitExcept("ZKSYNC_ENDPOINT_URL", ZKSYNC_TASK_ENABLE);
export const ZKSYNC_STORAGE_CONTRACT_ADDRESS = getParamOrExitExcept("ZKSYNC_STORAGE_CONTRACT_ADDRESS", ZKSYNC_TASK_ENABLE);

export const STARKNET_TASK_ENABLE = process.env.STARKNET_TASK_ENABLE as string !== 'false';
export const STARKNET_ACCOUNT = getParamOrExitExcept("STARKNET_ACCOUNT", STARKNET_TASK_ENABLE);
export const STARKNET_ENDPOINT_URL = getParamOrExitExcept("STARKNET_ENDPOINT_URL", STARKNET_TASK_ENABLE);
export const STARKNET_STORAGE_CONTRACT_ADDRESS = getParamOrExitExcept("STARKNET_STORAGE_CONTRACT_ADDRESS", STARKNET_TASK_ENABLE);

export const POLYGONZK_TASK_ENABLE = process.env.POLYGONZK_TASK_ENABLE as string !== 'false';
export const POLYGONZK_ACCOUNT = getParamOrExitExcept("POLYGONZK_ACCOUNT", POLYGONZK_TASK_ENABLE);
export const POLYGONZK_ENDPOINT_URL = getParamOrExitExcept("POLYGONZK_ENDPOINT_URL", POLYGONZK_TASK_ENABLE);
export const POLYGONZK_STORAGE_CONTRACT_ADDRESS = getParamOrExitExcept("POLYGONZK_STORAGE_CONTRACT_ADDRESS", POLYGONZK_TASK_ENABLE);

export const POLYGON_TASK_ENABLE = process.env.POLYGON_TASK_ENABLE as string !== 'false';
export const POLYGON_ACCOUNT = getParamOrExitExcept("POLYGON_ACCOUNT", POLYGON_TASK_ENABLE);
export const POLYGON_ENDPOINT_URL = getParamOrExitExcept("POLYGON_ENDPOINT_URL", POLYGON_TASK_ENABLE);
export const POLYGON_STORAGE_CONTRACT_ADDRESS = getParamOrExitExcept("POLYGON_STORAGE_CONTRACT_ADDRESS", POLYGON_TASK_ENABLE);

export const ELROND_TASK_ENABLE = process.env.ELROND_TASK_ENABLE as string !== 'false';
export const ELROND_API_URL = getParamOrExitExcept("ELROND_API_URL", ELROND_TASK_ENABLE);
export const ELROND_ACCOUNT = getParamOrExitExcept("ELROND_ACCOUNT", ELROND_TASK_ENABLE);
export const ELROND_STORAGE_CONTRACT_ADDRESS = getParamOrExitExcept("ELROND_STORAGE_CONTRACT_ADDRESS", ELROND_TASK_ENABLE);

export const ALGO_TASK_ENABLE = process.env.ALGO_TASK_ENABLE as string !== 'false';
export const ALGO_ACCOUNT = getParamOrExitExcept("ALGO_ACCOUNT", ALGO_TASK_ENABLE);
export const ALGO_STORAGE_APP_ID = parseInt(getParamOrExitExcept("ALGO_STORAGE_APP_ID", ALGO_TASK_ENABLE));
export const ALGO_INDEXER_URL = getParamOrExitExcept("ALGO_INDEXER_URL", ALGO_TASK_ENABLE);
export const ALGO_INDEXER_PORT = parseInt(getParamOrExitExcept("ALGO_INDEXER_PORT", ALGO_TASK_ENABLE));
export const ALGO_TOKEN = getParamOrExitExcept("ALGO_TOKEN", ALGO_TASK_ENABLE);

export const APTOS_TASK_ENABLE = process.env.APTOS_TASK_ENABLE as string !== 'false';
export const APTOS_ACCOUNT = getParamOrExitExcept("APTOS_ACCOUNT", APTOS_TASK_ENABLE);
export const APTOS_STORAGE_MODULE_ADDRESS = getParamOrExitExcept("APTOS_STORAGE_MODULE_ADDRESS", APTOS_TASK_ENABLE);
export const APTOS_NODE_URL = getParamOrExitExcept("APTOS_NODE_URL", APTOS_TASK_ENABLE);
export const APTOS_ORDER_EVENTS_TAG = getParamOrExitExcept("APTOS_ORDER_EVENTS_TAG", APTOS_TASK_ENABLE);

export const XSTORAGE_TASK_ENABLE = process.env.XSTORAGE_TASK_ENABLE as string !== 'false';
export const XSTORAGE_PARA_TASK_ENABLE = process.env.XSTORAGE_PARA_TASK_ENABLE as string !== 'false';
export const SHADOW_ENDPOINT_URL = getParamOrExitExcept("SHADOW_ENDPOINT_URL", XSTORAGE_TASK_ENABLE);
export const PARACHAIN_ENDPOINT_URL = getParamOrExitExcept("PARACHAIN_ENDPOINT_URL", XSTORAGE_PARA_TASK_ENABLE);

export const EVMChain2RPC = new Map<string,string>([
  //[EVMChainType.ETHEREUM, ETH_ENDPOINT_URL],
  [EVMChainType.ARB1, ARB1_ENDPOINT_URL],
  [EVMChainType.OPTIMISM, OP_ENDPOINT_URL],
  [EVMChainType.ZKSYNC, ZKSYNC_ENDPOINT_URL],
  //[EVMChainType.STARKNET, STARKNET_ENDPOINT_URL],
  [EVMChainType.POLYGONZK, POLYGONZK_ENDPOINT_URL],
  [EVMChainType.POLYGON, POLYGON_ENDPOINT_URL],
  [EVMChainType.BASE, BASE_ENDPOINT_URL],
  [EVMChainType.BLAST, BLAST_ENDPOINT_URL],
  [EVMChainType.PARA, PARA_CHAIN_ENDPOINT_URL],
  [EVMChainType.U2U, U2U_ENDPOINT_URL],
]);

export const TRYOUT = 10;

export const STORAGE_ORDER_EVM_ABI = [
  "event Order(address customer, address merchant, string cid, uint256 size, uint256 price, bool isPermanent)",
]
const storageOrderEVMTopics = [
  "Order(address,address,string,uint256,uint256,bool)",
]
export const STORAGE_ORDER_EVM_TOPICS = getTopics(storageOrderEVMTopics);
