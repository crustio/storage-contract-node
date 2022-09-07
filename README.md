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
CRUST_SEEDS=""
CRUST_CHAIN_URL="ws://localhost:19944"
ETH_ENDPOINT_URL="<ether_mainnet_json_rpc>"
ETH_STORAGE_CONTRACT_ADDRESS="0x6e9469673257e21b3e75bb9292c9ab009bc481d4"
ETH_ACCOUNT=""
POLYGON_ENDPOINT_URL="https://polygon-rpc.com/"
POLYGON_STORAGE_CONTRACT_ADDRESS="0xE1E8ff8e51DA7066CB1009a4c1dE68AE2d095655"
POLYGON_ACCOUNT=""
ELROND_API_URL="https://api.elrond.com"
ELROND_STORAGE_CONTRACT_ADDRESS="erd1qqqqqqqqqqqqqpgq9z44nz6t6nheyflvfh94syzky84gk0d8j3vss49tnh"
ELROND_ACCOUNT=""
SHADOW_ENDPOINT_URL="wss://rpc2-shadow.crust.network"
SHADOW_SUBSCAN_URL="https://shadow.webapi.subscan.io"
DB_PATH="/opt/crust/pinning-node"
API_PORT=8765
```

1. CRUST_SEEDS: Crust network account seeds
1. CRUST_CHAIN_URL: Crust network address, you can use the watcher started in previous step which is '***ws://localhost:19944***'
1. ETH_ENDPOINT_URL: Ether mainnet JSON RCP url, follow [this link](https://infura.io/) to obtain a free one
1. ETH_STORAGE_CONTRACT_ADDRESS: ETH storage contract address on ETH_ENDPOINT_URL which is ***0x6e9469673257e21b3e75bb9292c9ab009bc481d4***
1. ETH_ACCOUNT: current node's ETH account to receive users' payment
1. POLYGON_ENDPOINT_URL: Polygon mainnet JSON RCP url, default is ***https://polygon-rpc.com/***
1. POLYGON_STORAGE_CONTRACT_ADDRESS: Polygon storage contract address on POLYGON_ENDPOINT_URL which is ***0xE1E8ff8e51DA7066CB1009a4c1dE68AE2d095655***
1. POLYGON_ACCOUNT: current node's Polygon account to receive users' payment
1. ELROND_API_URL: Elrond api url which is ***https://api.elrond.com***
1. ELROND_STORAGE_CONTRACT_ADDRESS: Elrond storage contract address which is ***erd1qqqqqqqqqqqqqpgq9z44nz6t6nheyflvfh94syzky84gk0d8j3vss49tnh***
1. ELROND_ACCOUNT: current node's Elrond account to receive users' payment
1. DB_PATH: pinning node datbase path, default is ***/opt/crust/pinning-node***
1. API_PORT: API service port, default is ***8765***
1. SHADOW_ENDPOINT_URL: Crust shadow endpoint url, default is ***wss://rpc2-shadow.crust.network***
1. ETH_TASK_ENABLE: optional, boolean, set to false to disable ETH monitor task, default is true
1. POLYGON_TASK_ENABLE: optional, boolean, set to false to disable POLYGON monitor task, default is true
1. ELROND_TASK_ENABLE: optional, boolean, set to false to disable ELROND monitor task, default is true
1. XSTORAGE_TASK_ENABLE: optional, boolean, set to false to disable XSTORAGE monitor task, default is true

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
1. chainType: optional, should be 'eth' or ' elrond'

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
