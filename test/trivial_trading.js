var common = require('./trivial_tests_common.js');
var TrivialToken = artifacts.require("TrivialToken.sol");

contract('TrivialToken - Exchange tests', (accounts) => {
    var token;
    var trivialAddress = accounts[0];
    var artistAddress = accounts[1];
    var userAddress2 = accounts[2];
    var userAddress3 = accounts[3];
    var userAddress4 = accounts[4];

    async function contributeInIco() {
        assert.equal(await token.balanceOf.call(userAddress4), 0,
            'Should be zero before contribution');
        await token.contributeInIco({from: userAddress2, value: web3.toWei(2, 'ether')});
        await token.contributeInIco({from: userAddress3, value: web3.toWei(2, 'ether')});
        await token.contributeInIco({from: userAddress4, value: web3.toWei(3, 'ether')});
        assert.equal(await token.balanceOf.call(userAddress4), 0,
            'Should be zero after contribution');
    }

    async function throws(fn, ...args) {
        thrown = false;
        try { await fn(...args); }
        catch (err) { thrown = true; }
        return thrown;
    }

    beforeEach(async () => {
        token = await TrivialToken.new();
        await token.initToken(
            'TrivialTest',
            'TRVLTEST',
            common.now() + 6000,
            600,
            artistAddress,
            trivialAddress,
            200000,
            100000,
            700000,
            '0x71544d4D42dAAb49D9F634940d3164be25ba03Cc'
        );
        await token.startIco({from: trivialAddress});
        assert.equal(await token.currentState.call(), 1, 'Should be one');
        await contributeInIco();
        common.goForwardInTime(6001);
        await token.distributeTokens(3);
        await token.finishIco();
        assert.equal(parseInt(await token.balanceOf.call(userAddress2)), 200000,
            'User2 - Should be 200000');
        assert.equal(parseInt(await token.balanceOf.call(userAddress3)), 200000,
            'User3 - Should be 200000');
    })

    it('users should transfer tokens', async () => {
        await token.transfer(userAddress3, 100000, {from: userAddress2});
        assert.equal(parseInt(await token.balanceOf.call(userAddress2)), 100000,
            'User2 - Should be 100000');
        assert.equal(parseInt(await token.balanceOf.call(userAddress3)), 300000,
            'User3 - Should be 300000');
    })

    it('exchange should be able to trade tokens for users', async () => {
        // Scenario: user2 agrees to trade 500 tokens
        // For 1000 tokens from user3 through exchange (user4)
        await token.approve(userAddress4, 500, {from: userAddress2});
        await token.approve(userAddress4, 1000, {from: userAddress3});
        await token.transferFrom(userAddress2, userAddress3, 500, {from: userAddress4});
        await token.transferFrom(userAddress3, userAddress2, 1000, {from: userAddress4});
        assert.equal(parseInt(await token.balanceOf.call(userAddress2)), 200500,
            'User2 - Should be 200500');
        assert.equal(parseInt(await token.balanceOf.call(userAddress3)), 199500,
            'User3 - Should be 199500');
        assert.equal(parseInt(await token.balanceOf.call(userAddress4)), 300000,
            'User3 - Balance should stay the same');
    })

    it('exchange shouldn\'t be able to steal tokens', async () => {
        // Scenario: user2 agrees to trade 500 tokens
        // For 1000 tokens from user3 through exchange (user4)
        // But exchange want to steal 100x more from users
        await token.approve(userAddress4, 500, {from: userAddress2});
        await token.approve(userAddress4, 1000, {from: userAddress3});
        assert.isOk(await throws(
            token.transferFrom, userAddress2, userAddress4, 100500, {from: userAddress4}
        ), 'bidInAuction - Should be thrown - equal');
        assert.isOk(await throws(
            token.transferFrom, userAddress3, userAddress4, 101000, {from: userAddress4}
        ), 'bidInAuction - Should be thrown - equal');
        assert.equal(parseInt(await token.balanceOf.call(userAddress2)), 200000,
            'User2 - Balance should stay the same');
        assert.equal(parseInt(await token.balanceOf.call(userAddress3)), 200000,
            'User3 - Balance should stay the same');
        assert.equal(parseInt(await token.balanceOf.call(userAddress4)), 300000,
            'User3 - Balance should stay the same');
    })

});
