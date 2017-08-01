var trivial_builder = require('./trivial_builder.js');
var DevelopmentToken = artifacts.require("DevelopmentTrivialToken.sol");
var BigNumber = require('bignumber.js')


function goForwardInTime(seconds) {
    web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [seconds],
      id: new Date().getTime()
  });
}

contract('TrivialToken - ICO tests', (accounts) => {

    var token, me;
    var trivialContractBuilder;
    var trivialAddress = accounts[0];
    var artistAddress = accounts[1];
    var otherUserAddress = accounts[2];

    beforeEach(async () => {
        trivialContract = await DevelopmentToken.new(
            'TrivialTest',
            'TRVLTEST',
            Math.floor(Date.now() / 1000 + 600),
            600,
            artistAddress,
            trivialAddress,
            200000,
            100000,
            700000
        );
        trivialContractBuilder = new trivial_builder.TrivialContractBuilder(trivialContract, trivialAddress);
        me = await trivialContract.getSelf.call();
    })

    async function throws(fn, ...args) {
        thrown = false;
        try { await fn(...args); }
        catch (err) { thrown = true; }
        return thrown;
    }

    async function startIco() {
        assert.equal(await trivialContract.currentState.call(), 0, 'Should be Created');
        await trivialContract.becomeTrivial();
        assert.equal(await trivialContract.getSelf.call(), me, 'Should be old self');
        assert.equal(await trivialContract.getTrivial.call(), me, 'Should be Trivial');
        await trivialContract.startIco();
        assert.equal(await trivialContract.currentState.call(), 1, 'Should be IcoStarted');
    }

    async function contributeIco() {
        assert.equal(await trivialContract.contributorsCount.call(), 0, 'Should be zero');
        await trivialContract.contributeInIco({from: accounts[0], value: 100000000000000000});
        await trivialContract.contributeInIco({from: accounts[1], value: 100000000000000000});
        await trivialContract.contributeInIco({from: accounts[2], value: 200000000000000000});
        await trivialContract.contributeInIco({from: accounts[3], value: 300000000000000000});
        assert.equal(await trivialContract.contributorsCount.call(), 4, 'Should be two');
    }

    async function finishIco() {
        assert.isOk(await throws(trivialContract.finishIco), 'finishIco - Should be thrown');
        await trivialContract.setIcoEndTimePast();
        await trivialContract.distributeTokens(4);
        await trivialContract.finishIco();
        assert.equal(await trivialContract.currentState.call(), 2, 'Should be IcoFinished');
        assert.isOk(await throws(
            trivialContract.contributeInIco, {from: accounts[1], value: 100000000000000000}
        ), 'contributeInIco - Should be thrown');
    }

    it('Trivial can start ico', async () => {
        await trivialContract.startIco({from: trivialAddress});
    })

    it('Artist cannot start ico', async () => {
        assert.isOk(await throws(trivialContract.startIco, {from: artistAddress}));
    })

    it('Other user cannot start ico', async () => {
        assert.isOk(await throws(trivialContract.startIco, {from: otherUserAddress}));
    })

    it('User must contribute amounts bigger than 0.01 ether ', async () => {
        trivialContract = (await trivialContractBuilder.icoStarted()).get();
        assert.isOk(await throws(trivialContract.contributeInIco, {value: web3.toWei(0.01, 'ether')}));
        var minProperAmount = (new BigNumber(web3.toWei(0.01, 'ether'))).add(1).toString()
        await trivialContract.contributeInIco({value: minProperAmount});
    })

    it('Go IcoCancelled state if nobody contributed and ICO is finished', async () => {
        trivialContract = (await trivialContractBuilder.icoStarted()).get();
        goForwardInTime(601);
        trivialContract.finishIco();
        assert.equal(await trivialContract.currentState.call(), 5, 'Should be IcoCancelled');
    })

    it('check Finish ICO', async () => {
        await startIco();
        await contributeIco();
        await finishIco();
    })

    it('cancel ICO no contributors', async () => {
        await startIco();
        await trivialContract.cancelIco();
        assert.isOk(await throws(trivialContract.claimIcoContribution, accounts[0]
        ), 'claimIcoContribution - Should be thrown');
        assert.isOk(await throws(trivialContract.contributeInIco,
            {from: accounts[0], value: 100000000000000000}
        ), 'contributeInCancel - Should be thrown');
        assert.equal(await trivialContract.currentState.call(), 5, 'Current state is different');
        await trivialContract.killContract();
        assert.isOk(await throws(trivialContract.name.call), 'Token name should not exist');
    })

    it('cancel ICO with contributors and refund them', async () => {
        await startIco();
        await contributeIco();
        var balanceInIco = parseInt(await trivialContract.getBalance(accounts[0]));
        await trivialContract.cancelIco();
        await trivialContract.claimIcoContribution(accounts[0]);
        assert.isAbove(parseInt(await trivialContract.getBalance(accounts[0])),
            balanceInIco, 'Cancel ICO should return funds');
        assert.isOk(await throws(trivialContract.contributeInIco,
            {from: accounts[0], value: 100000000000000000}
        ), 'contributeInCancel - Should be thrown');
        assert.equal(await trivialContract.currentState.call(), 5, 'Current state is different');
        await trivialContract.killContract();
        assert.isOk(await throws(trivialContract.name.call), 'Token name should not exist');
    })

});
