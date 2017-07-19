pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/TrivialToken.sol";

contract TestTrivialToken {
    function testTrivialToken() {
        uint256 icoEndTime = now + 10 minutes;
        uint256 auctionDuration = 10 minutes;
        address artist = 0xE5f25b81b38D29A6e9C4E6Bd755d09ea4Ed10ff5;
        address trivial = 0xeAD3d0eD2685Bd669fe1D6BfdFe6F681912326D0;
        TrivialToken token = new TrivialToken(
            icoEndTime, auctionDuration, artist, trivial,
            200000, 200000, 600000
        );
        uint256 i = 1;
        Assert.equal(i, 1, "empty");
    }
}
