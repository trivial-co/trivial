var TrivialToken = artifacts.require("TrivialToken.sol");


contract('TrivialToken', function(accounts) {
    it('empty test', function () {
        assert.equal(true, true, 'dummy test passed');
    });
    // it("should create TrivialToken", function() {
    //     return TrivialToken.deployed()
    //         .then(function(instance) {
    //             return instance.getBalance.call(accounts[0]);
    //         })
    //         .then(function(balance) {
    //             assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
    //         });
    // });
});
