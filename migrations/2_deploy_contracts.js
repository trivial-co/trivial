var TrivialToken = artifacts.require("./TrivialToken.sol");

module.exports = function(deployer, network) {
    if (network != "production") {
        deployer.deploy(
            TrivialToken,
            'TrivialTest',
            'TRVLTEST',
            60,
            600,
            '0x71544d4D42dAAb49D9F634940d3164be25ba03Cc',
            '0x71544d4D42dAAb49D9F634940d3164be25ba03Cc',
            200000,
            100000,
            700000,
            '0x71544d4D42dAAb49D9F634940d3164be25ba03Cc'
        );
    } else {
        // production
        const TWO_WEEKS_IN_SECONDS = 1209600;
        deployer.deploy(
            TrivialToken,
            'Chain Token',
            'TCT',
            600,
            TWO_WEEKS_IN_SECONDS,
            '0x70dc1075F2c26923028Cfe36fDa46ACABB343bB2',
            '0x70dc1075F2c26923028Cfe36fDa46ACABB343bB2',
            350000,
            50000,
            600000,
            '0x71544d4D42dAAb49D9F634940d3164be25ba03Cc'
        );
    }

};
