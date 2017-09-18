var common = require('./trivial_tests_common.js');
var TrivialToken = artifacts.require("TrivialToken.sol");

contract('TrivialToken - Auction tests', (accounts) => {

    var trivialContract;
    var trivial = accounts[0];
    var artist = accounts[1];
    var otherUserAddress = accounts[2];
    var bidder = accounts[3];
    var sender = accounts[4];
    var receiver = accounts[5];
    var keyHolder = accounts[6];

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

    it('Auction can only be started after free period end', async () => {
        trivialContract = (await (await trivialContractBuilder.contributions({
            [keyHolder]: 1,
        })).icoFinished()).get();
        assert.isOk(await throws(trivialContract.startAuction, {from: keyHolder}));
        common.goForwardInTime(60 * 24 * 3600 + 1);
        await trivialContract.startAuction({from: keyHolder});
        assert.equal(await trivialContract.currentState(), 3, 'Should be AuctionStarted');
    })

    it('Auction can be started by key holders', async () => {
        trivialContract = (await (await trivialContractBuilder.contributions({
            [keyHolder]: 1,
        })).icoFinished()).get();
        common.goForwardInTime(60 * 24 * 3600 + 1);
        assert.isOk(await throws(trivialContract.startAuction, {from: otherUserAddress}));
        await trivialContract.startAuction({from: keyHolder});
        assert.equal(await trivialContract.currentState(), 3, 'Should be AuctionStarted');
    })

    it('Auction can be started by artist, even when they are not key holders', async () => {
        trivialContract = (await (await trivialContractBuilder.contributions({
            [keyHolder]: 1,
        })).icoFinished()).get();
        await trivialContract.transfer(receiver, 200000, {from: artist}) // artist now has no tokens
        common.goForwardInTime(60 * 24 * 3600 + 1);
        await trivialContract.startAuction({from: artist});
        assert.equal(await trivialContract.currentState(), 3, 'Should be AuctionStarted');
    })

    it('Sending funds to contract during auction will bid', async () => {
        trivialContract = (await trivialContractBuilder.auctionStarted(bidder)).get();
        trivialContract.sendTransaction({value: web3.toWei(1, 'ether'), from: otherUserAddress});
        assert.equal(await trivialContract.highestBidder(), otherUserAddress);
        assert.equal(await trivialContract.highestBid(), web3.toWei(1, 'ether'));
    })

    it('Auction is immediately finished if it is started by all tokens holder', async () => {
        trivialContract = (await (await trivialContractBuilder.contributions({
            [keyHolder]: 1,
        })).icoFinished()).get();
        await trivialContract.transfer(keyHolder, 200000, {from: artist});
        await trivialContract.transfer(keyHolder, 100000, {from: trivial});
        common.goForwardInTime(60 * 24 * 3600 + 1);
        await trivialContract.startAuction({from: keyHolder});
        assert.equal(await trivialContract.currentState(), 4);
        assert.equal(await trivialContract.highestBidder(), keyHolder);
    })

    it('First bidder cannot bid less than minEthAmount', async () => {
        var minEthAmount = web3.toWei(0.01, 'ether')
        trivialContract = (await trivialContractBuilder.auctionStarted(keyHolder)).get();
        assert.isOk(await throws(trivialContract.bidInAuction, {from: otherUserAddress, value: minEthAmount - 2}));
        await trivialContract.bidInAuction({from: otherUserAddress, value: minEthAmount});
        assert.equal(await trivialContract.highestBidder(), otherUserAddress);
        assert.equal(await trivialContract.highestBid(), minEthAmount);
    })

    it('Next bid must be at least 110% of the previous bid', async () => {
        trivialContract = (await trivialContractBuilder.auctionStarted(keyHolder)).get();
        await trivialContract.bidInAuction({from: bidder, value: web3.toWei(1, 'ether')});
        assert.isOk(await throws(trivialContract.bidInAuction, {from: otherUserAddress, value: web3.toWei(1.0999, 'ether')}));
        await trivialContract.bidInAuction({from: otherUserAddress, value: web3.toWei(1.1, 'ether')});
        assert.equal(await trivialContract.highestBidder(), otherUserAddress);
        assert.equal(await trivialContract.highestBid(), web3.toWei(1.1, 'ether'));
    })

    it('Overbidden gets back his bid amount', async () => {
        var bidAmount = web3.toWei(1, 'ether');
        trivialContract = (await trivialContractBuilder.auctionStarted(keyHolder)).get();
        await trivialContract.bidInAuction({from: bidder, value: bidAmount});
        var bidderBalanceBeforeOverbid = web3.eth.getBalance(bidder).toNumber();
        await trivialContract.bidInAuction({from: otherUserAddress, value: 1.1 * bidAmount});
        var bidderBalanceAfterOverbid = web3.eth.getBalance(bidder).toNumber();
        assert.equal(bidderBalanceAfterOverbid - bidderBalanceBeforeOverbid, bidAmount);
    })

    it('Current bidder cannot transfer tokens', async () => {
        trivialContract = (await trivialContractBuilder.auctionStarted(bidder)).get();
        await trivialContract.bidInAuction({from: bidder, value: web3.toWei(0.05, 'ether')});
        assert.isOk(await throws(trivialContract.transfer, receiver, 10, {from: bidder}));
    })

    it('Current bidder cannot receive tokens', async () => {
        trivialContract = (await trivialContractBuilder.auctionStarted(sender)).get();
        await trivialContract.bidInAuction({from: bidder, value: web3.toWei(0.05, 'ether')});
        assert.isOk(await throws(trivialContract.transfer, bidder, 10, {from: sender}));
    })

    it('Tokens may be transferred between non-biddeers during auction', async () => {
        // otherUserAddress2 has 700000 tokens
        trivialContract = (await trivialContractBuilder.auctionStarted(sender)).get();
        await trivialContract.bidInAuction({from: bidder, value: web3.toWei(0.05, 'ether')});
        await trivialContract.transfer(receiver, 100000, {from: sender});
        assert.equal(parseInt(await trivialContract.balanceOf.call(receiver)), 100000);
        assert.equal(parseInt(await trivialContract.balanceOf.call(sender)), 600000);
    })

    it('Current bidder cannot be a sender in transferFrom call', async () => {
        trivialContract = (await trivialContractBuilder.auctionStarted(bidder)).get();
        await trivialContract.bidInAuction({from: bidder, value: web3.toWei(0.05, 'ether')});
        trivialContract.approve(otherUserAddress, 1000, {from: bidder});
        assert.isOk(await throws(trivialContract.transferFrom, bidder, receiver, 100, {from: otherUserAddress}));
    })

    it('Current bidder cannot be a receiver in transferFrom call', async () => {
        trivialContract = (await trivialContractBuilder.auctionStarted(sender)).get();
        await trivialContract.bidInAuction({from: bidder, value: web3.toWei(0.05, 'ether')});
        trivialContract.approve(otherUserAddress, 1000, {from: sender});
        assert.isOk(await throws(trivialContract.transferFrom, sender, bidder, 100, {from: otherUserAddress}));
    })

    it('Current bidder may transfer tokens using transferFrom between non-biddeers during auction', async () => {
        // otherUserAddress2 has 700000 tokens
        trivialContract = (await trivialContractBuilder.auctionStarted(sender)).get();
        await trivialContract.bidInAuction({from: bidder, value: web3.toWei(0.05, 'ether')});
        trivialContract.approve(bidder, 100000, {from: sender});
        await trivialContract.transferFrom(sender, receiver, 100000, {from: bidder});
        assert.equal(parseInt(await trivialContract.balanceOf.call(receiver)), 100000);
        assert.equal(parseInt(await trivialContract.balanceOf.call(sender)), 600000);
    })

    it('Tokens cannot be transferred after auction end time', async () => {
        trivialContract = (await trivialContractBuilder.auctionStarted(sender)).get();
        await trivialContract.bidInAuction({from: bidder, value: web3.toWei(0.05, 'ether')});
        common.goForwardInTime(6000 + 1);
        assert.isOk(await throws(trivialContract.transfer, receiver, 10, {from: sender}));
    })

    it('transferFrom cannot be called after auction end time', async () => {
        trivialContract = (await trivialContractBuilder.auctionStarted(sender)).get();
        await trivialContract.bidInAuction({from: bidder, value: web3.toWei(0.05, 'ether')});
        trivialContract.approve(bidder, 1000, {from: sender});
        common.goForwardInTime(6000 + 1);
        assert.isOk(await throws(trivialContract.transferFrom, sender, receiver, 100, {from: bidder}));
    })
});
