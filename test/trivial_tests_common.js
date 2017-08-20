const repl = require('repl');

function goForwardInTime(seconds) {
    web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [seconds],
      id: new Date().getTime()
  });
}

class TrivialContractBuilder {
    constructor(trivialContract, trivialAddress) {
        this.trivialContract = trivialContract;
        this.trivialAddress = trivialAddress;
    }

    async icoStarted() {
        await this.trivialContract.startIco({from: this.trivialAddress});
        return this;
    }

    async icoCancelled() {
        await this.icoStarted();
        await this.trivialContract.cancelIco({from: this.trivialAddress});
        return this;
    }

    async contributions(_contributions) {
        await this.icoStarted();
        for (var address in _contributions) {
            var contribution = _contributions[address];
            await this.trivialContract.contributeInIco({from: address, value: web3.toWei(contribution, 'ether')});
        }
        return this;
    }

    async IcoFinished() {
        goForwardInTime(6001);
        await this.trivialContract.distributeTokens(100);
        await this.trivialContract.finishIco();
        return this;
    }

    get() {
        return this.trivialContract;
    }
}

function now() {
    return parseInt(web3.currentProvider.send(
        {jsonrpc:"2.0", method: "eth_getBlockByNumber", params:["latest", false]})['result']['timestamp']
    );
}

module.exports.TrivialContractBuilder = TrivialContractBuilder;
module.exports.now = now;
