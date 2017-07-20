var TrivialToken = artifacts.require("TrivialToken.sol");
var DevelopmentToken = artifacts.require("DevelopmentTrivialToken.sol");

contract('TrivialToken', function(accounts) {
    it('empty test', function () {
        assert.equal(true, true, 'Should always pass');
    });
    it('should create TrivialToken', function() {
        var token;
        return TrivialToken.deployed()
            .then(function(instance) {
                token = instance; return token;
            })
            .then(function(value) {
                return token.name.call();
            })
            .then(function(value) {
                assert.equal(
                    value.valueOf(),
                    'Trivial',
                    'Token name is not Trivial :)'
                );
            });
    });
    it('check Trivial state', function() {
        var token;
        return TrivialToken.deployed()
            .then(function(instance) {
                token = instance; return token;
            })
            .then(function(value) {
                return token.currentState.call();
            })
            .then(function(value) {
                assert.equal(
                    value.valueOf(),
                    0,
                    'Current state is different'
                );
            });
    });
    it('check ICO start', function() {
        var token, me;
        return DevelopmentToken.deployed()
            .then(function(instance) {
                token = instance; return token;
            })
            .then(function(value) {
                return token.getSelf.call();
            })
            .then(function(value) {
                me = value; return me;
            })
            .then(function(value) {
                return token.getTrivial.call();
            })
            .then(function(value) {
                assert.notEqual(
                    value.valueOf(),
                    me,
                    'I should not be Trivial'
                );
            })
            .then(function(value) {
                return token.becomeTrivial();
            })
            .then(function(value) {
                return token.getSelf.call();
            })
            .then(function(value) {
                assert.equal(
                    value.valueOf(),
                    me,
                    'I should be old self'
                );
            })
            .then(function(value) {
                return token.getTrivial.call();
            })
            .then(function(value) {
                assert.equal(
                    value.valueOf(),
                    me,
                    'I should be Trivial'
                );
            })
            .then(function(value) {
                return token.startIco();
            })
            .then(function(value) {
                return token.currentState.call();
            })
            .then(function(value) {
                assert.equal(
                    value.valueOf(),
                    1,
                    'Current state is different'
                );
            });
    })
});
