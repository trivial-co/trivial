var common = require('./trivial_tests_common.js');
var TrivialToken = artifacts.require("TrivialToken.sol");


contract('TrivialToken - Auction tests', (accounts) => {

    var trivialContract;
    var trivialAddress = accounts[0];
    var artistAddress = accounts[1];
    var otherUserAddress = accounts[2];
    var otherUserAddress2 = accounts[2];

    beforeEach(async () => {
        trivialContract = await TrivialToken.new(
            'TrivialTest',
            'TRVLTEST',
            6000,
            600,
            artistAddress,
            trivialAddress,
            200000,
            100000,
            700000,
            '0x71544d4D42dAAb49D9F634940d3164be25ba03Cc'
        );
        trivialContractBuilder = new common.TrivialContractBuilder(trivialContract, trivialAddress);
    })

    async function throws(fn, ...args) {
        thrown = false;
        try { await fn(...args); }
        catch (err) { thrown = true; }
        return thrown;
    }

    async function startAuction() {
        common.goForwardInTime(60 * 24 * 3600 + 1);
        await token.startAuction();
        assert.equal(await token.currentState(), 3, 'Should be AuctionStarted');
        assert.isAbove(await token.auctionEndTime(),
            common.now(), 'Should be in future');
    }

    async function bidAuction() {
        var balance = parseInt(await token.getBalance(accounts[4]));
        var bid = 300000000000000000;

        assert.equal(await token.highestBid.call(), 0, 'Should be zero');
        await token.bidInAuction({from: accounts[4], value: bid});

        var balanceAfterBidAndTax = parseInt(await token.getBalance(accounts[4]));
        assert.isBelow(balanceAfterBidAndTax, balance - bid, 'After balance');

        assert.equal(await token.highestBid.call(), bid, 'Should be equal to bid: ' + bid);
        assert.isOk(await throws(
            token.bidInAuction, {from: accounts[5], value: bid}
        ), 'bidInAuction - Should be thrown - equal');
        assert.isOk(await throws(
            token.bidInAuction, {from: accounts[5], value: bid + 100}
        ), 'bidInAuction - Should be thrown - small');

        await token.bidInAuction({from: accounts[5], value: 350000000000000000});
        assert.equal(
            await token.highestBid.call(), 350000000000000000, 'Should be 350000000000000000');

        assert.equal(parseInt(
            await token.getBalance(accounts[4])), balanceAfterBidAndTax + bid, 'Refund balance');
    }

    async function finishAuction() {
        assert.isAbove(await token.auctionEndTime.call(),
            common.now(), 'Should be in future');
        assert.isOk(await throws(token.finishAuction), 'finishAuction - Should be thrown');
        await token.setAuctionEndTimePast();
        assert.isBelow(await token.auctionEndTime.call(),
            common.now(), 'Should be in past');
        await token.finishAuction();
        assert.equal(await token.currentState.call(), 4, 'Should be AuctionFinished');
        assert.isOk(await throws(
            token.bidInAuction, {from: accounts[6], value: 900000000000000000}
        ), 'bidInAuction - Should be thrown');
    }

    it('Auction can only be started after free period end', async () => {
        trivialContract = (await (await trivialContractBuilder.contributions({
            [otherUserAddress]: 1,
        })).icoFinished()).get();
        assert.isOk(await throws(trivialContract.startAuction, {from: otherUserAddress}));
        common.goForwardInTime(60 * 24 * 3600 + 1);
        await trivialContract.startAuction();
        assert.equal(await trivialContract.currentState(), 3, 'Should be AuctionStarted');
    })

    it('Current bidder cannot transfer tokens', async () => {
        trivialContract = (await trivialContractBuilder.auctionStarted(otherUserAddress)).get();
        await trivialContract.bidInAuction({from: otherUserAddress, value: web3.toWei(0.05, 'ether')});
        await trivialContract.transfer(otherUserAddress2, 10, {from: otherUserAddress});
    })
});
