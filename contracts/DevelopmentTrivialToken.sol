pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./TrivialToken.sol";

contract DevelopmentTrivialToken is TrivialToken {
    function DevelopmentTrivialToken(
        string _name, string _symbol,
        uint256 _icoEndTime, uint256 _auctionDuration,
        address _artist, address _trivial,
        uint256 _tokensForArtist,
        uint256 _tokensForTrivial,
        uint256 _tokensForIco,
        bytes32 _descriptionHash
    ) /*TrivialToken(
        _name, _symbol,
        _icoEndTime, _auctionDuration, _artist, _trivial,
        _tokensForArtist, _tokensForTrivial, _tokensForIco,
        _descriptionHash
    )*/ {}

    /*
        Development
    */
    function setStateCreated() { currentState = State.Created; }
    function setStateIcoStarted() { currentState = State.IcoStarted; }
    function setStateIcoFinished() { currentState = State.IcoFinished; }
    function setStateAuctionStarted() { currentState = State.AuctionStarted; }
    function setStateAuctionFinished() { currentState = State.AuctionFinished; }
    function setStateIcoCancelled() { currentState = State.IcoCancelled; }

    function setTrivial(address sender) { trivial = sender; }
    function becomeTrivial() { trivial = msg.sender; }
    function setArtist(address sender) { artist = sender; }
    function becomeArtist() { artist = msg.sender; }
    function getTrivial() constant returns (address) { return trivial; }
    function getArtist() constant returns (address) { return artist; }
    function getSelf() constant returns (address) { return msg.sender; }
    function becomeKeyHolder() {
        balances[msg.sender] = SafeMath.div(tokensForIco, TOKENS_PERCENTAGE_FOR_KEY_HOLDER); }

    function setIcoEndTime(uint256 time) { icoEndTime = time; }
    function setIcoEndTimeOneMinute() { icoEndTime = now + 1 minutes; }
    function setIcoEndTimePast() { icoEndTime = now - 1 minutes; }
    function setAuctionEndTime(uint256 time) { auctionEndTime = time; }
    function setAuctionEndTimeOneMinute() { auctionEndTime = now + 1 minutes; }
    function setAuctionEndTimePast() { auctionEndTime = now - 1 minutes; }

    function getBalance(address account) constant returns (uint256) { return account.balance; }
    function getTokens(address account) constant returns (uint256) { return balances[account]; }
    function setTokens(address account, uint256 amount) { balances[account] = amount; }
}
