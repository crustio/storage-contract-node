// Load env

// eslint-disable-next-line node/no-extraneous-require
require('dotenv').config();

export const CRUST_SEEDS = process.env.CRUST_SEEDS as string;
export const CRUST_CHAIN_URL = process.env.CRUST_CHAIN_URL as string;
export const ETH_ACCOUNT = process.env.ETH_ACCOUNT as string;
export const ETH_ENDPOINT_URL = process.env.ETH_ENDPOINT_URL as string;
export const ETH_STORAGE_CONTRACT_ADDRESS = process.env.ETH_STORAGE_CONTRACT_ADDRESS as string;
export const POLYGON_ACCOUNT = process.env.POLYGON_ACCOUNT as string;
export const POLYGON_ENDPOINT_URL = process.env.POLYGON_ENDPOINT_URL as string;
export const POLYGON_STORAGE_CONTRACT_ADDRESS = process.env.POLYGON_STORAGE_CONTRACT_ADDRESS as string;
export const ARB1_ACCOUNT = process.env.ARB1_ACCOUNT as string;
export const ARB1_ENDPOINT_URL = process.env.ARB1_ENDPOINT_URL as string;
export const ARB1_STORAGE_CONTRACT_ADDRESS = process.env.ARB1_STORAGE_CONTRACT_ADDRESS as string;
export const ELROND_STORAGE_CONTRACT_ADDRESS = process.env.ELROND_STORAGE_CONTRACT_ADDRESS as string;
export const ELROND_API_URL = process.env.ELROND_API_URL as string;
export const ELROND_ACCOUNT = process.env.ELROND_ACCOUNT as string;
export const APTOS_ACCOUNT = process.env.APTOS_ACCOUNT as string;
export const APTOS_STORAGE_MODULE_ADDRESS = process.env.APTOS_STORAGE_MODULE_ADDRESS as string;
export const APTOS_NODE_URL = process.env.APTOS_NODE_URL as string;
export const APTOS_ORDER_EVENTS_TAG = process.env.APTOS_ORDER_EVENTS_TAG as string;
export const SHADOW_ENDPOINT_URL = process.env.SHADOW_ENDPOINT_URL as string;
export const DB_PATH = process.env.DB_PATH as string;
export const API_PORT = parseInt(process.env.API_PORT as string);
export const TRYOUT = 10;
export const ETH_TASK_ENABLE = process.env.ETH_TASK_ENABLE as string !== 'false';
export const POLYGON_TASK_ENABLE = process.env.POLYGON_TASK_ENABLE as string !== 'false';
export const ARB1_TASK_ENABLE = process.env.ARB1_TASK_ENABLE as string !== 'false';
export const ELROND_TASK_ENABLE = process.env.ELROND_TASK_ENABLE as string !== 'false';
export const XSTORAGE_TASK_ENABLE = process.env.XSTORAGE_TASK_ENABLE as string !== 'false';
export const APTOS_TASK_ENABLE = process.env.APTOS_TASK_ENABLE as string !== 'false';
export const STORAGE_ORDER_ABI = [
  "event Order(address customer, address merchant, string cid, uint size, uint price)",
  "event OrderInERC20(address customer, address merchant, string cid, uint size, uint price, address token)"
]
