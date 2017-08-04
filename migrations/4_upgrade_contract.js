var TrivialTokenUpgrade = artifacts.require("./TrivialTokenUpgrade.sol");

module.exports = function(deployer, network) {
    if (network != "production") {
        deployer.deploy(
            TrivialTokenUpgrade,
            '0x617c6b45102d5b11a86e27b002baed9cc7283f65', //address of deployed token
            'TrivialDev',
            'TRT',
            'ff2f38bf7d94e9257340c3be0e82726ce6f51cc1bdf3593bcffcbf5e344a484b', //hash of item description
            1 //contributorsCount
        );
    } else {
        deployer.deploy(
            TrivialTokenUpgrade,
            '0x158a96da5dcd1ade84ac11ac952683c0ee3516ab',
            'TrivialDev',
            'TRT',
            'ff2f38bf7d94e9257340c3be0e82726ce6f51cc1bdf3593bcffcbf5e344a484b', //hash of item description
            7, //contributorsCount
{value: web3.toWei(0.25, 'ether')});
    }
};
