var DevelopmentToken = artifacts.require("DevelopmentTrivialToken.sol");


contract('TrivialToken - Auction tests', (accounts) => {

    var token, me;

    beforeEach(async () => {
        token = await DevelopmentToken.new(
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
        await token.finishIco();
        assert.equal(await token.currentState.call(), 2, 'Should be two');
    })

    async function throws(fn, ...args) {
        thrown = false;
        try { await fn(...args); }
        catch (err) { thrown = true; }
        return thrown;
    }

    it('check Auction start', async () => {
        await token.startAuction();
        assert.equal(await token.currentState.call(), 3, 'Should be three');
        assert.isAbove(await token.auctionEndTime.call(),
            Math.floor(Date.now() / 1000), 'Should be in future');
    })
});