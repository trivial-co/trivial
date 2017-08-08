const repl = require('repl');

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

    get() {
        return this.trivialContract;
    }
}

module.exports.TrivialContractBuilder = TrivialContractBuilder;
