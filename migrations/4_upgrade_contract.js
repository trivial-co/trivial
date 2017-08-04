var TrivialTokenUpgrade = artifacts.require("./TrivialTokenUpgrade.sol");

module.exports = function(deployer, network) {
    if (network != "production") {
        deployer.deploy(
            TrivialTokenUpgrade,
            '0xeAD3d0eD2685Bd669fe1D6BfdFe6F681912326D0', //address of deployed token
            'TrivialDev',
            'TRVLDEV',
            'e6bd14970ce33d3f1abc794c8e3c7321da77e67a9790257f9a02838a75f9d4a65f073c4ab11fd2930919f11bd6f92abdd571e85d8d35a9711d12fde52b19e2fc', //hash of item description
            3 //contributorsCount
        );
    } else {
        deployer.deploy(
            TrivialTokenUpgrade,
            '0x158a96da5dcd1ade84ac11ac952683c0ee3516ab',
            'TrivialDev',
            'TRVLDEV',
            'e6bd14970ce33d3f1abc794c8e3c7321da77e67a9790257f9a02838a75f9d4a65f073c4ab11fd2930919f11bd6f92abdd571e85d8d35a9711d12fde52b19e2fc', //hash of item description
            7 //contributorsCount
        );
    }
};
