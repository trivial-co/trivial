var DevelopmentTrivialToken = artifacts.require("./DevelopmentTrivialToken.sol");

module.exports = function(deployer, network) {
    if (network != "production") {
        deployer.deploy(DevelopmentTrivialToken);
    }
};
