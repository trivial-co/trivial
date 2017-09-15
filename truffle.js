var HDWalletProvider = require('truffle-hdwallet-provider');

var mnemonic = "speed enforce stone place abuse drastic fiscal amused path arch slot adjust";

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
    },
    ropsten: {
      network_id: 3, // Official ropsten network id
      provider: new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/IMsVbCijmt9z4RnBadCo'),
      gas: 4000000,
      gasPrice: 30000000000,
    },
    production: {
        network_id: 1, // Official main network id
        provider: new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/IMsVbCijmt9z4RnBadCo'),
        gas: 4000000,
        gasPrice: 40000000000,
    }
  }
};
