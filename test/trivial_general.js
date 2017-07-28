var DevelopmentToken = artifacts.require("DevelopmentTrivialToken.sol");


contract('TrivialToken - General tests', (accounts) => {

    var token;

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
    })

    async function throws(fn, ...args) {
        thrown = false;
        try { await fn(...args); }
        catch (err) { thrown = true; }
        return thrown;
    }

    it('should create TrivialToken', async () => {
        assert.equal(await token.name.call(), 'TrivialTest', 'Token name is not Trivial');
        assert.equal(await token.currentState.call(), 0, 'Current state is different');
    })

    it('should test selfdestruct', async () => {
        assert.equal(await token.name.call(), 'TrivialTest', 'Token name is not Trivial');
        await token.becomeTrivial();
        await token.setStateIcoCancelled();
        assert.equal(await token.currentState.call(), 5, 'Current state is different');
        await token.killContract();
        assert.isOk(await throws(token.name.call), 'Token name should not exist');
    })

});
