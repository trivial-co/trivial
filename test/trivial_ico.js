var DevelopmentToken = artifacts.require("DevelopmentTrivialToken.sol");


contract('TrivialToken - ICO tests', (accounts) => {

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
    })

    async function throws(fn, ...args) {
        thrown = false;
        try { await fn(...args); }
        catch (err) { thrown = true; }
        return thrown;
    }

    async function startIco() {
        assert.equal(await token.currentState.call(), 0, 'Should be Created');
        assert.notEqual(await token.getTrivial.call(), me, 'Should not be Trivial');
        await token.becomeTrivial();
        assert.equal(await token.getSelf.call(), me, 'Should be old self');
        assert.equal(await token.getTrivial.call(), me, 'Should be Trivial');
        await token.startIco();
        assert.equal(await token.currentState.call(), 1, 'Should be IcoStarted');
    }

    async function contributeIco() {
        assert.equal(await token.contributorsCount.call(), 0, 'Should be zero');
        await token.contributeInIco({from: accounts[0], value: 100000000000000000});
        await token.contributeInIco({from: accounts[1], value: 100000000000000000});
        await token.contributeInIco({from: accounts[2], value: 200000000000000000});
        await token.contributeInIco({from: accounts[3], value: 200000000000000000});
        assert.equal(await token.contributorsCount.call(), 4, 'Should be two');
    }

    async function finishIco() {
        assert.isOk(await throws(token.finishIco), 'finishIco - Should be thrown');
        await token.setIcoEndTimePast();
        await token.finishIco();
        assert.equal(await token.currentState.call(), 2, 'Should be IcoFinished');
        assert.isOk(await throws(
            token.contributeInIco, {from: accounts[1], value: 100000000000000000}
        ), 'contributeInIco - Should be thrown');
    }

    it('check ICO start', async () => {
        await startIco();
    })

    it('check ICO contribution', async () => {
        await startIco();
        await contributeIco();
    })

    it('check Finish ICO', async () => {
        await startIco();
        await contributeIco();
        await finishIco();
    })
});
