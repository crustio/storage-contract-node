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
ETH_ENDPOINT_URL="http://localhost:8545"
ETH_STORAGE_CONTRACT_ADDRESS=""
ETH_ACCOUNT=""
ELROND_API_URL="https://api.elrond.com"
ELROND_STORAGE_CONTRACT_ADDRESS="erd1qqqqqqqqqqqqqpgq9z44nz6t6nheyflvfh94syzky84gk0d8j3vss49tnh"
ELROND_ACCOUNT=""
DB_PATH="/opt/crust/pinning-node"
API_PORT=8765
```

1. CRUST_SEEDS: Crust network account seeds
1. CRUST_CHAIN_URL: Crust network address, you can use the watcher started in previous step which is '***ws://localhost:19944***'
1. ETH_ENDPOINT_URL: monitored chain endpoint address
1. ETH_STORAGE_CONTRACT_ADDRESS: ETH storage contract address on ETH_ENDPOINT_URL
1. ETH_ACCOUNT: current node's ETH account to receive users' payment
1. ELROND_API_URL: Elrond api url which is ***https://api.elrond.com***
1. ELROND_STORAGE_CONTRACT_ADDRESS: Elrond storage contract address which is ***erd1qqqqqqqqqqqqqpgq9z44nz6t6nheyflvfh94syzky84gk0d8j3vss49tnh***
1. ELROND_ACCOUNT: current node's Elrond account to receive users' payment
1. DB_PATH: pinning node datbase path, default is ***/opt/crust/pinning-node***
1. API_PORT: API service port, default is ***8765***

### Start service
```
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
