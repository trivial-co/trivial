var TrivialToken = artifacts.require("TrivialToken.sol");


contract('TrivialToken - General tests', (accounts) => {

    var token;

    beforeEach(async () => {
        token = await TrivialToken.deployed();
    })

    it('should create TrivialToken', async () => {
        assert.equal(await token.name.call(), 'TrivialTest', 'Token name is not Trivial')
        assert.equal(await token.currentState.call(), 0, 'Current state is different')
    })

});
