var trivial_builder = require('./trivial_builder.js');
var TrivialToken = artifacts.require("TrivialToken.sol");
var State = {
    "Created": 0,
    "IcoStarted": 1,
    "IcoCancelled": 5
};

contract('TrivialToken - General tests', (accounts) => {

    var token;
    var trivialContractBuilder;
    var trivialAddress = accounts[0];
    var artistAddress = accounts[1];

    beforeEach(async () => {
        trivialContract = await TrivialToken.new(
            'TrivialTest',
            'TRVLTEST',
            Math.floor(Date.now() / 1000 + 600),
            600,
            artistAddress,
            trivialAddress,
            200000,
            100000,
            700000
        );
        trivialContractBuilder = new trivial_builder.TrivialContractBuilder(trivialContract, trivialAddress);
    })

    async function throws(fn, ...args) {
        thrown = false;
        try { await fn(...args); }
        catch (err) { thrown = true; }
        return thrown;
    }

    it('should create TrivialToken', async () => {
        assert.equal(await trivialContract.name(), 'TrivialTest', 'Token name is not Trivial');
        assert.equal(await trivialContract.currentState(), State.Created, 'Current state is different');
    })
});
