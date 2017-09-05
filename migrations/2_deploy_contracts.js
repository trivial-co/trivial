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
        // deploy at 14:00 CET
        // do the ICO with 1 contrib different than trivial
        // ICO will take 10 minutes
        // start auction at 15:00 CET
        const DLD_44_HOURS = 158400;
        deployer.deploy(
            TrivialToken,
            'DLD Token',
            'DLDTKN',
            600,
            DLD_44_HOURS,
            '0x71544d4D42dAAb49D9F634940d3164be25ba03Cc',
            '0x71544d4D42dAAb49D9F634940d3164be25ba03Cc',
            200000,
            100000,
            700000,
            '0x71544d4D42dAAb49D9F634940d3164be25ba03Cc'
        );
    }

};
