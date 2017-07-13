var HDWalletProvider = require('truffle-hdwallet-provider');

var mnemonic = "trivial solve trivial spirit trivial fine trivial rhythm trivial feature trivial away";

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
    },
    ropsten: {
      network_id: 3,    // Official ropsten network id
      provider: new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/IMsVbCijmt9z4RnBadCo'),
      gas: 500000,
    },
  }
};
