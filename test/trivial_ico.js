var common = require('./trivial_tests_common.js');
var TrivialToken = artifacts.require("TrivialToken.sol");
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

    var token;
    var trivialContractBuilder;
    var trivialAddress = accounts[0];
    var artistAddress = accounts[1];
    var otherUserAddress = accounts[2];

    beforeEach(async () => {
        trivialContract = await TrivialToken.new(
            'TrivialTest',
            'TRVLTEST',
            common.now() + 600,
            600,
            artistAddress,
            trivialAddress,
            200000,
            100000,
            700000
        );
        trivialContractBuilder = new common.TrivialContractBuilder(trivialContract, trivialAddress);
    })

    async function throws(fn, ...args) {
        thrown = false;
        try { await fn(...args); }
        catch (err) { thrown = true; }
        return thrown;
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

    it('Users cannot contribute to ICO after ICO end time', async () => {
        trivialContract = (await trivialContractBuilder.icoStarted()).get();
        await trivialContract.contributeInIco({value: web3.toWei(5, 'ether')});
        goForwardInTime(601);
        assert.isOk(await throws(trivialContract.contributeInIco, {value: web3.toWei(4, 'ether')}));
    })

    it('User must contribute amounts bigger than 0.005 ether ', async () => {
        trivialContract = (await trivialContractBuilder.icoStarted()).get();
        assert.isOk(await throws(trivialContract.contributeInIco, {value: web3.toWei(0.005, 'ether')}));
        var minProperAmount = (new BigNumber(web3.toWei(0.005, 'ether'))).add(1).toString()
        await trivialContract.contributeInIco({value: minProperAmount});
    })

    it('amountRaised is equal to sum of all contributions', async () => {
        trivialContract = (await trivialContractBuilder.contributions({
            [accounts[0]]: 4, [accounts[1]]: 3, [accounts[2]]: 3, [accounts[3]]: 5
        })).get();
        assert.equal(await trivialContract.amountRaised(), web3.toWei(15, 'ether'));
    })

    it('amountRaised is equal to sum of all contributions', async () => {
        trivialContract = (await trivialContractBuilder.contributions({
            [accounts[0]]: 4, [accounts[1]]: 3, [accounts[2]]: 3, [accounts[3]]: 5
        })).get();
        assert.equal(await trivialContract.amountRaised(), web3.toWei(15, 'ether'));
    })

    it('Artist gets tokensForArtist tokens if he contributed nothing', async () => {
        trivialContract = (await (await trivialContractBuilder.contributions({
            [otherUserAddress]: 10
        })).IcoFinished()).get();
        var tokensForArtist = await trivialContract.tokensForArtist();
        assert.equal(await trivialContract.balanceOf(artistAddress), tokensForArtist);
    })

    it('Go to IcoCancelled state if nobody contributed and ICO is finished', async () => {
        trivialContract = (await trivialContractBuilder.icoStarted()).get();
        goForwardInTime(601);
        trivialContract.finishIco();
        assert.equal(await trivialContract.currentState.call(), 5, 'Should be IcoCancelled');
    })
});
