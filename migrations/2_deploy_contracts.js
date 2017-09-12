var TrivialToken = artifacts.require("TrivialToken.sol");

module.exports = function(deployer, network) {
    deployer.deploy(TrivialToken);
};
