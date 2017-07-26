pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/BasicToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "../interface/ERC223TokenInterface.sol";
import "../interface/ERC223ReceiverInterface.sol";

/*
 * @based on: https://github.com/OpenZeppelin/zeppelin-solidity/pull/266
 */

contract ERC223Token is BasicToken, ERC223TokenInterface {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    function name() constant returns (string _name) {
        return name;
    }
    function symbol() constant returns (string _symbol) {
        return symbol;
    }
    function decimals() constant returns (uint8 _decimals) {
        return decimals;
    }
    function totalSupply() constant returns (uint256 _totalSupply) {
        return totalSupply;
    }

    /**
     * @dev Fix for the ERC20 short address attack.
     */
    modifier onlyPayloadSize(uint size) {
        require(msg.data.length >= size + 4);
        _;
    }

    function transfer(address to, uint value, bytes data) onlyPayloadSize(2 * 32) returns (bool) {
        balances[msg.sender] = SafeMath.sub(balances[msg.sender], value);
        balances[to] = SafeMath.add(balances[to], value);
        if (isContract(to)){
            ERC223ReceiverInterface receiver = ERC223ReceiverInterface(to);
            receiver.tokenFallback(msg.sender, value, data);
        }
        //ERC223 event
        Transfer(msg.sender, to, value, data);
        return true;
    }

    function transfer(address to, uint value) returns (bool) {
        bytes memory empty;
        transfer(to, value, empty);
        //ERC20 legacy event
        Transfer(msg.sender, to, value);
        return true;
    }

    function isContract(address _address) private returns (bool isContract) {
        uint length;
        _address = _address; //Silence compiler warning
        assembly { length := extcodesize(_address) }
        return length > 0;
    }
}
