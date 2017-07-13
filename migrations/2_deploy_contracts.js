var TrivialToken = artifacts.require("./TrivialToken.sol");

module.exports = function(deployer) {
  deployer.deploy(TrivialToken);
};
