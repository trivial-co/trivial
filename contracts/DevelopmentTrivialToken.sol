pragma solidity ^0.4.11;

import "./TrivialToken.sol";

contract DevelopmentTrivialToken is TrivialToken {
    string constant NAME = 'DevelopmentTrivial';
    string constant SYMBOL = 'DEVTRVL';

    function DevelopmentTrivialToken(
        uint256 _icoEndTime, uint256 _auctionDuration,
        address _artist, address _trivial,
        uint256 _tokensForArtist,
        uint256 _tokensForTrivial,
        uint256 _tokensForIco
    ) TrivialToken(
        _icoEndTime, _auctionDuration, _artist, _trivial,
        _tokensForArtist, _tokensForTrivial, _tokensForIco
    ) {}

    /*
        Development
    */
    function setStateCreated() { currentState = State.Created; }
    function setStateIcoStarted() { currentState = State.IcoStarted; }
    function setStateIcoFinished() { currentState = State.IcoFinished; }
    function setStateAuctionStarted() { currentState = State.AuctionStarted; }
    function setStateAuctionFinished() { currentState = State.AuctionFinished; }
    function setTrivial(address sender) { trivial = sender; }
    function becomeTrivial() { trivial = msg.sender; }
    function setArtist(address sender) { artist = sender; }
    function becomeArtist() { artist = msg.sender; }
    function setIcoEndTime(uint256 time) { icoEndTime = time; }
    function setIcoEndTimeTenMinutes() { icoEndTime = now + 10 minutes; }
    function setAuctionEndTime(uint256 time) { auctionEndTime = time; }
    function setAuctionEndTimeTenMinutes() { auctionEndTime = now + 10 minutes; }
    function becomeKeyHolder() {
        balances[msg.sender] = safeDiv(tokensForIco, TOKENS_PERCENTAGE_FOR_KEY_HOLDER); }
    function getTrivial() returns (address) { return trivial; }
    function getArtist() returns (address) { return artist; }
    function getSelf() returns (address) { return msg.sender; }
}
