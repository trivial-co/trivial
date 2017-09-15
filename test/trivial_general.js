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
        token = await TrivialToken.new();
        await token.initOne(
            'TrivialTest',
            'TRVLTEST',
            0,
            6000,
            6000,
            artistAddress,
            trivialAddress,
            '0x71544d4D42dAAb49D9F634940d3164be25ba03Cc'
        );
        await token.initTwo(
            1000000,
            200000,
            100000,
            700000,
            web3.toWei(0.01, 'ether'),
            10,
            25,
            6000,
            6000
        );
        trivialContractBuilder = new common.TrivialContractBuilder(token, trivialAddress);
    })

    async function throws(fn, ...args) {
        thrown = false;
        try { await fn(...args); }
        catch (err) { thrown = true; }
        return thrown;
    }

    it('should create TrivialToken', async () => {
        assert.equal(await token.name(), 'TrivialTest', 'Token name is not Trivial');
        assert.equal(await token.currentState(), State.Created, 'Current state is different');
    })
});
