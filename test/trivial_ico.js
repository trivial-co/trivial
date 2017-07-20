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

    async function start_auction() {
        assert.notEqual(await token.getTrivial.call(), me, 'I should not be Trivial');
        await token.becomeTrivial();
        assert.equal(await token.getSelf.call(), me, 'I should be old self');
        assert.equal(await token.getTrivial.call(), me, 'I should be Trivial');
        await token.startIco();
        assert.equal(await token.currentState.call(), 1, 'Current state is not IcoStarted');
    }

    it('check ICO start', async () => await start_auction())

    it('check ICO contribution', async () => {
        assert.equal(await token.currentState.call(), 0, 'State should be Created');
        await start_auction();
        // assert.equal(await token.contributors(), 0, 'Should be empty');
        await token.contributeInIco({from: accounts[0], value: 100000000000000000});
        // assert.notEqual(await token.contributors().length, 0, 'Should not be empty');
    })

});
