var common = require('./trivial_tests_common.js');
var TrivialToken = artifacts.require("TrivialToken.sol");

contract('TrivialToken - After auction tests', (accounts) => {

    var trivialContract;
    var trivial = accounts[0];
    var artist = accounts[1];
    var otherUserAddress = accounts[2];
    var bidder = accounts[3];
    var keyHolder = accounts[4];
    var auctionWinner = accounts[5];

    beforeEach(async () => {
        trivialContract = await TrivialToken.new()
        await trivialContract.initOne(
            'TrivialTest',
            'TRVLTEST',
            0,
            6000,
            6000,
            artist,
            trivial,
            '0x71544d4D42dAAb49D9F634940d3164be25ba03Cc'
        );
        await trivialContract.initTwo(
            1000000,
            200000,
            100000,
            700000,
            web3.toWei(0.01, 'ether'),
            10,
            25,
            180 * 24 * 3600,
            60 * 24 * 3600
        );
        trivialContractBuilder = new common.TrivialContractBuilder(trivialContract, trivial);
    })

    async function throws(fn, ...args) {
        thrown = false;
        try { await fn(...args); }
        catch (err) { thrown = true; }
        return thrown;
    }

    it('Auction can be finished only after auction end time', async () => {
        var trivialContract = (await trivialContractBuilder.auctionStarted(keyHolder)).get();
        await trivialContract.bidInAuction({from: bidder, value: web3.toWei(0.05, 'ether')});
        assert.isOk(await throws(trivialContract.finishAuction, {from: otherUserAddress}));
        common.goForwardInTime(6000 + 1);
        await trivialContract.finishAuction();
        assert.equal(await trivialContract.currentState(), 4);
    })

    it('Auction can be finished only if at least one person bids', async () => {
        var trivialContract = (await trivialContractBuilder.auctionStarted(keyHolder)).get();
        common.goForwardInTime(6000 + 1);
        assert.isOk(await throws(trivialContract.finishAuction, {from: otherUserAddress}));
    })

    it('Only auction winner can set winner message hash', async () => {
        var messageHash = '0x1111111111111111111111111111111111111111111111111111111111111111';
        var trivialContract = (await trivialContractBuilder.auctionFinished(auctionWinner)).get();
        assert.isOk(await throws(trivialContract.setAuctionWinnerMessageHash, messageHash, {from: otherUserAddress}));
        await trivialContract.setAuctionWinnerMessageHash(messageHash, {from: auctionWinner});
        assert.equal(await trivialContract.auctionWinnerMessageHash(), messageHash);
    })

    it('Tokens holder after auction can withdraw ', async () => {
        var trivialContract = (await trivialContractBuilder.auctionStarted(keyHolder)).get();
        var highestBid = web3.toWei(10, 'ether');
        await trivialContract.bidInAuction({from: bidder, value: highestBid});
        common.goForwardInTime(6000 + 1);
        await trivialContract.finishAuction();
        // keyHolder had 70% of tokens
        var keyHolderBalanceBeforeWithdraw = web3.eth.getBalance(keyHolder).toNumber();
        await trivialContract.withdrawShares(keyHolder, {from: otherUserAddress});
        var keyHolderBalanceAfterWithdraw = web3.eth.getBalance(keyHolder).toNumber();
        assert.equal(keyHolderBalanceAfterWithdraw - keyHolderBalanceBeforeWithdraw, 0.7 * highestBid);
    })

    it('Tokens holder cannot withdraw shares more than once', async () => {
        var trivialContract = (await trivialContractBuilder.auctionStarted(keyHolder)).get();
        var highestBid = web3.toWei(10, 'ether');
        await trivialContract.bidInAuction({from: bidder, value: highestBid});
        common.goForwardInTime(6000 + 1);
        await trivialContract.finishAuction();

        await trivialContract.withdrawShares(keyHolder, {from: otherUserAddress});
        assert.isOk(await throws(trivialContract.withdrawShares, keyHolder, {from: otherUserAddress}));
    })

    it('Auction winner cannot withdraw his shares', async () => {
        var trivialContract = (await trivialContractBuilder.auctionFinished(auctionWinner)).get();
        // keyHolder had 70% of tokens
        var auctionWinnerBalanceBeforeWithdraw = web3.eth.getBalance(auctionWinner).toNumber();
        await trivialContract.withdrawShares(auctionWinner, {from: otherUserAddress});
        var auctionWinnerBalanceAfterWithdraw = web3.eth.getBalance(auctionWinner).toNumber();
        assert.equal(auctionWinnerBalanceAfterWithdraw - auctionWinnerBalanceBeforeWithdraw, 0);
    })
});
