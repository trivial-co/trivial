pragma solidity ^0.4.11;

import "../v102/V102.sol";

contract V103 is V102 {
    //Item description
    struct DescriptionHash {
        bytes32 descriptionHash;
        uint256 timestamp;
    }
    DescriptionHash public descriptionHash;
    DescriptionHash[] public descriptionHashHistory;
}
