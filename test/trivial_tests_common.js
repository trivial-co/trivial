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

    async icoFinished() {
        goForwardInTime(6001);
        await this.trivialContract.distributeTokens(100);
        await this.trivialContract.finishIco();
        return this;
    }

    async auctionStarted(startAuctionFrom) {
        await this.contributions({[startAuctionFrom]: 1});
        await this.icoFinished();
        goForwardInTime(60 * 24 * 3600 + 1);
        await this.trivialContract.startAuction({from: startAuctionFrom});
        return this;
    }

    async auctionFinished(auctionWinner) {
        await this.auctionStarted(auctionWinner);
        await this.trivialContract.bidInAuction({from: auctionWinner, value: web3.toWei(0.05, 'ether')});
        goForwardInTime(6000 + 1);
        await this.trivialContract.finishAuction();
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
module.exports.goForwardInTime = goForwardInTime;
