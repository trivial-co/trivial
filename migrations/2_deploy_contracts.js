var TrivialToken = artifacts.require("./TrivialToken.sol");

module.exports = function(deployer) {
    if (network != "production") {
        deployer.deploy(
            TrivialToken,
            'TrivialTest',
            'TRVLTEST',
            Math.floor(Date.now() / 1000 + 600),
            600,
            '0xE5f25b81b38D29A6e9C4E6Bd755d09ea4Ed10ff5',
            '0xeAD3d0eD2685Bd669fe1D6BfdFe6F681912326D0',
            200000,
            100000,
            700000
        );
    } else {
        // production
        const TWO_WEEKS_IN_SECONDS = 1209600;
        deployer.deploy(
            TrivialToken,
            'Rat Token',
            'TRT',
            Math.floor((Date.now() / 1000) + TWO_WEEKS_IN_SECONDS),
            TWO_WEEKS_IN_SECONDS,
            '0x70dc1075F2c26923028Cfe36fDa46ACABB343bB2',
            '0x70dc1075F2c26923028Cfe36fDa46ACABB343bB2',
            350000,
            50000,
            600000
        );
    }

};
