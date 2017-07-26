pragma solidity ^0.4.11;

/*
 * @based on: https://github.com/OpenZeppelin/zeppelin-solidity/pull/266
 */

contract ERC223ReceiverInterface {
    function tokenFallback(address from, uint value, bytes data);
}
