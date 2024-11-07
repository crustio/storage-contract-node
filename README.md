# storage-contract-node
The order node service for stroage contracts

## Start up

### Start Crust watcher 

Please allow your ***30888*** port by running(on ubuntu):
```
sudo ufw allow 30888
```

At project root directory run:
```
sudo docker-compose -f docker/crust-watcher.yaml up -d
```
to start a watcher for order and wait for chain synchronization complete. You can use '***sudo docker logs crust-watch -f***' to see syncing progress

### Bootstrap configure 
***.env*** file needs to be created in the project root directory, a sample ***.env*** file shows as follow:
```
# Crust network account seeds
CRUST_SEEDS=""
CRUST_CHAIN_URL="ws://localhost:19944"

# 1. Ethereum configure
# Follow https://infura.io to obtain a free eth endpoint
ETH_ENDPOINT_URL="<ether_mainnet_json_rpc>"
ETH_STORAGE_CONTRACT_ADDRESS="0xE391613d2056e47F74ED5eF1d443d4CDB21AAAd9"
# Ethereum storage order merchant address, set your address here
ETH_ACCOUNT=""

# 2. Arbitrum-One configure
ARB1_ENDPOINT_URL="https://arb1.arbitrum.io/rpc"
ARB1_STORAGE_CONTRACT_ADDRESS="0x9ae6c9d00fde0e0f774693ca6099d06dfe2001c6"
# Arbitrum One storage order merchant address, set your address here
ARB1_ACCOUNT=""

# 3. Optimism configure
OP_ENDPOINT_URL="https://rpc.ankr.com/optimism"
OP_STORAGE_CONTRACT_ADDRESS="0xf8e6F7bb144D3475fcf39Bd879510Fa93C775ee2"
# Optimism storage order merchant address, set your address here
OP_ACCOUNT=""

# 4. zkSync configure
ZKSYNC_ENDPOINT_URL="https://mainnet.era.zksync.io"
ZKSYNC_STORAGE_CONTRACT_ADDRESS="0xfa866AbF8F0b8f154654DEd956B2467dFB6A4135"
# zkSync storage order merchant address, set your address here
ZKSYNC_ACCOUNT=""

# 5. Polygon configure
POLYGON_ENDPOINT_URL="https://polygon-rpc.com/"
POLYGON_STORAGE_CONTRACT_ADDRESS="0xE1E8ff8e51DA7066CB1009a4c1dE68AE2d095655"
# Polygon storage order merchant address, set your address here
POLYGON_ACCOUNT=""

# 6. Elrond configure
ELROND_API_URL="https://api.elrond.com"
ELROND_STORAGE_CONTRACT_ADDRESS="erd1qqqqqqqqqqqqqpgq9z44nz6t6nheyflvfh94syzky84gk0d8j3vss49tnh"
# Elrond storage order merchant address, set your address here
ELROND_ACCOUNT=""

# 7. Xstorage configure
SHADOW_ENDPOINT_URL="wss://rpc2-shadow.crust.network"
SHADOW_SUBSCAN_URL="https://shadow.webapi.subscan.io"

# 7.1 Xstorage-Para configure
PARACHAIN_ENDPOINT_URL="wss://crust-parachain.crustapps.net"

# 8. Aptos configure
APTOS_NODE_URL="https://fullnode.mainnet.aptoslabs.com"
APTOS_STORAGE_MODULE_ADDRESS="0x59c6f5359735a27beba04252ae5fee4fc9c6ec0b7e22dab9f5ed7173283c54d0"
APTOS_ORDER_EVENTS_TAG="storage::OrderEvent"
# Aptos storage order merchant address, set your address here
APTOS_ACCOUNT=""

# 9. Algorand configure
ALGO_INDEXER_URL="https://mainnet-idx.algonode.cloud"
ALGO_INDEXER_PORT=443
ALGO_STORAGE_APP_ID="1275319623"
ALGO_TOKEN='a'.repeat(64)
# Algorand storage order merchant address, set your address here
ALGO_ACCOUNT=""

DB_PATH="/opt/crust/pinning-node"
API_PORT=33333
```
Note: If you just want to serve some of the chains storage service above, set **XXX_TASK_ENABLE=false** to disable the others which XXX is the network you want to disable, such as **ETH_TASK_ENABLE=false**

### Start service
```
yarn
yarn build && yarn start
```

## API

### /api/v0/order

```
curl -XGET http://localhost:8765/api/v0/order
```

Get new order information

Arguments:
1. status: optional, should be 'new' or 'ordered'
1. chainType: optional, such as 'eth', ' elrond'

curl example:
```
curl 'http://localhost:8765/api/v0/order?status=ordered&chainType=eth'

// Output:
[
  {
    "customer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "merchant": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    "cid": "QmfH5zLmBtptUxRSGWazaumGwSsCW3n6P164eRXpbFatmJ",
    "size": 5246268,
    "token": "0x821f3361D454cc98b7555221A06Be563a7E2E0A6",
    "price": "3706",
    "blockNumber": 14797355,
    "chainType": "eth",
    "txHash": "0x9005dd2689f42f2ab49a98f1c0e2d4dd64c0d346ec7a2ef9460f682fd2dad683",
    "timestamp": 1652927711,
    "status": "ordered"
  }
]
```
