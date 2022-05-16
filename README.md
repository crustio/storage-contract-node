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
