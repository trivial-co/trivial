var TrivialTokenUpgrade = artifacts.require("./TrivialTokenUpgrade.sol");

module.exports = function(deployer, network) {
    if (network != "production") {
        deployer.deploy(
            TrivialTokenUpgrade,
            '0xeAD3d0eD2685Bd669fe1D6BfdFe6F681912326D0', //address of deployed token
            'TrivialDev',
            'TRVLDEV',
            '0xE5f25b81b38D29A6e9C4E6Bd755d09ea4Ed10ff5', //hash of item description
            3 //contributorsCount
        );
    } else {
        deployer.deploy(
            TrivialTokenUpgrade,
            '0x158a96da5dcd1ade84ac11ac952683c0ee3516ab',
            'TrivialDev',
            'TRVLDEV',
            '0xE5f25b81b38D29A6e9C4E6Bd755d09ea4Ed10ff5', //hash of item description
            7 //contributorsCount
        );
    }
};
