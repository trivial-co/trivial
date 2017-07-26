pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/ERC20Basic.sol';

/*
 * @based on: https://github.com/OpenZeppelin/zeppelin-solidity/pull/266
 */

contract ERC223TokenInterface {
    function name() constant returns (string _name);
    function symbol() constant returns (string _symbol);
    function decimals() constant returns (uint8 _decimals);
    function totalSupply() constant returns (uint256 _totalSupply);

    function transfer(address to, uint value, bytes data) returns (bool);
    event Transfer(address indexed from, address indexed to, uint value, bytes data);
}
