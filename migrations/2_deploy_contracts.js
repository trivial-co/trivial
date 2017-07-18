var TrivialToken = artifacts.require("./TrivialToken.sol");

module.exports = function(deployer) {
  deployer.deploy(
      TrivialToken,
      Math.floor(Date.now() / 1000 + 600),
      600,
      '0xE5f25b81b38D29A6e9C4E6Bd755d09ea4Ed10ff5',
      '0xeAD3d0eD2685Bd669fe1D6BfdFe6F681912326D0',
      200000,
      100000,
      700000
  );
};
