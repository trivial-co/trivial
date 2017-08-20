var common = require('./trivial_tests_common.js');
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
            common.now() + 6000,
            6000,
            artistAddress,
            trivialAddress,
            200000,
            100000,
            700000
        );
        trivialContractBuilder = new common.TrivialContractBuilder(trivialContract, trivialAddress);
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
