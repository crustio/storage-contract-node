# nosical api image
FROM ubuntu:18.04

RUN apt-get clean
RUN apt-get update --fix-missing
RUN apt-get install -y curl
RUN apt-get install -y build-essential
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs
RUN npm install --global yarn
ADD src /storage-contract-node/src
ADD .env /storage-contract-node/.env
ADD package.json /storage-contract-node/package.json
ADD tsconfig.json /storage-contract-node/tsconfig.json
ADD yarn.lock /storage-contract-node/yarn.lock
ADD VERSION /storage-contract-node/VERSION
RUN cd /storage-contract-node && yarn && yarn build
CMD cd /storage-contract-node && yarn start
