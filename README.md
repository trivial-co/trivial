# trivial

## Installation

- Install Dependencies: `npm install`

## Deploy

For local development:

- Run local network: `docker-compose up`
- Run local: `npm run migrate`

For public test network:

- Run on Ropsten: `npm run migrate-public`

For main production network:

- Run on Mainnet: `npm run migrate-production`

## Test

For local testing:

- Run local network: `docker-compose up`
- Run: `npm test`

## Generate bytecode and ABI

- Go to https://remix.ethereum.org and paste concatenated source of `PrecompiledToken.sol` and `TrivialToken.sol`:

![alt text](https://raw.githubusercontent.com/trivial-co/trivial/feature/precompiled-token/imgs/paste.png "Paste screenshot")

- Hit compile contract button:

![alt_text](https://raw.githubusercontent.com/trivial-co/trivial/feature/precompiled-token/imgs/compile.png "Compile screenshot")

- Go to contract details:

![alt_text](https://raw.githubusercontent.com/trivial-co/trivial/feature/precompiled-token/imgs/details.png "Details screenshot")

- Copy bytecode:

![alt_text](https://raw.githubusercontent.com/trivial-co/trivial/feature/precompiled-token/imgs/bytecode.png "Bytecode screenshot")

- And ABI:

![alt_text](https://raw.githubusercontent.com/trivial-co/trivial/feature/precompiled-token/imgs/interface.png "ABI screenshot")
