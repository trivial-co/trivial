var TrivialTokenUpgrade = artifacts.require("./TrivialTokenUpgrade.sol");

module.exports = function(deployer, network) {
    if (network != "production") {
        deployer.deploy(
            TrivialTokenUpgrade,
            '0xeAD3d0eD2685Bd669fe1D6BfdFe6F681912326D0', //address of deployed token
            'TrivialDev',
            'TRVLDEV',
            'ff2f38bf7d94e9257340c3be0e82726ce6f51cc1bdf3593bcffcbf5e344a484b', //hash of item description
            3 //contributorsCount
        );
    } else {
        deployer.deploy(
            TrivialTokenUpgrade,
            '0x158a96da5dcd1ade84ac11ac952683c0ee3516ab',
            'TrivialDev',
            'TRVLDEV',
            'ff2f38bf7d94e9257340c3be0e82726ce6f51cc1bdf3593bcffcbf5e344a484b', //hash of item description
            7 //contributorsCount
        );
    }
};
