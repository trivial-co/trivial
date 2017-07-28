var DevelopmentToken = artifacts.require("DevelopmentTrivialToken.sol");


contract('TrivialToken - Auction tests', (accounts) => {

    var token, me;

    beforeEach(async () => {
        token = await DevelopmentToken.new(
            'TrivialTest',
            'TRVLTEST',
            Math.floor(Date.now() / 1000 + 600),
            600,
            '0xE5f25b81b38D29A6e9C4E6Bd755d09ea4Ed10ff5',
            '0xeAD3d0eD2685Bd669fe1D6BfdFe6F681912326D0',
            200000,
            100000,
            700000
        );
        me = await token.getSelf.call();
        assert.equal(await token.currentState.call(), 0, 'Should be zero');
        await token.becomeTrivial();
        await token.startIco();
        assert.equal(await token.currentState.call(), 1, 'Should be one');
        await token.contributeInIco({from: accounts[0], value: 100000000000000000});
        await token.contributeInIco({from: accounts[1], value: 100000000000000000});
        await token.contributeInIco({from: accounts[2], value: 200000000000000000});
        await token.contributeInIco({from: accounts[3], value: 200000000000000000});
        await token.contributeInIco({from: me, value: 300000000000000000});
        await token.setIcoEndTimePast();
        await token.distributeTokens(5);
        await token.finishIco();
        assert.equal(await token.currentState.call(), 2, 'Should be two');
    })

    async function throws(fn, ...args) {
        thrown = false;
        try { await fn(...args); }
        catch (err) { thrown = true; }
        return thrown;
    }

    async function startAuction() {
        await token.startAuction();
        assert.equal(await token.currentState.call(), 3, 'Should be AuctionStarted');
        assert.isAbove(await token.auctionEndTime.call(),
            Math.floor(Date.now() / 1000), 'Should be in future');
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
            Math.floor(Date.now() / 1000), 'Should be in future');
        assert.isOk(await throws(token.finishAuction), 'finishAuction - Should be thrown');
        await token.setAuctionEndTimePast();
        assert.isBelow(await token.auctionEndTime.call(),
            Math.floor(Date.now() / 1000), 'Should be in past');
        await token.finishAuction();
        assert.equal(await token.currentState.call(), 4, 'Should be AuctionFinished');
        assert.isOk(await throws(
            token.bidInAuction, {from: accounts[6], value: 900000000000000000}
        ), 'bidInAuction - Should be thrown');
    }

    it('check Auction start', async () => {
        await startAuction();
    })

    it('check Bid auction', async () => {
        await startAuction();
        await bidAuction();
    })

    it('check Finish auction', async () => {
        await startAuction();
        await bidAuction();
        await finishAuction();
    })
});
