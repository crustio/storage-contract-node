# nosical api image
FROM ubuntu:20.04

RUN apt-get clean
RUN apt-get update --fix-missing
RUN apt-get install -y curl
RUN apt-get install -y build-essential
RUN apt-get install -y ca-certificates gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install nodejs -y
RUN npm install --global yarn
ADD src /storage-contract-node/src
ADD .env /storage-contract-node/.env
ADD package.json /storage-contract-node/package.json
ADD tsconfig.json /storage-contract-node/tsconfig.json
ADD yarn.lock /storage-contract-node/yarn.lock
ADD VERSION /storage-contract-node/VERSION
RUN cd /storage-contract-node && yarn && yarn build
CMD cd /storage-contract-node && yarn start
