// Load env

// eslint-disable-next-line node/no-extraneous-require
require('dotenv').config();

export const CRUST_SEEDS = process.env.CRUST_SEEDS as string;
export const CRUST_CHAIN_URL = process.env.CRUST_CHAIN_URL as string;
export const ETH_ACCOUNT = process.env.ETH_ACCOUNT as string;
export const ELROND_STORAGE_CONTRACT_ADDRESS = process.env.ELROND_STORAGE_CONTRACT_ADDRESS as string;
export const ELROND_API_URL = process.env.ELROND_API_URL as string;
export const ELROND_ACCOUNT = process.env.ELROND_ACCOUNT as string;
export const ETH_ENDPOINT_URL = process.env.ETH_ENDPOINT_URL as string;
export const ETH_STORAGE_CONTRACT_ADDRESS = process.env.ETH_STORAGE_CONTRACT_ADDRESS as string;
export const DB_PATH = process.env.DB_PATH as string;
export const API_PORT = parseInt(process.env.API_PORT as string);
export const TRYOUT = 10;
export const STORAGE_ORDER_ABI = [
  "event Order(address customer, address merchant, string cid, uint size, uint price)",
  "event OrderInERC20(address customer, address merchant, string cid, uint size, uint price, address token)"
]
