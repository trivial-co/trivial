pragma solidity ^0.4.11;

import "./TrivialToken.sol";

contract DevelopmentTrivialToken is TrivialToken {
    string constant NAME = 'DevelopmentTrivial';
    string constant SYMBOL = 'DEVTRVL';

    /*
        Development
    */
    function setStateCreated() { currentState = State.Created; }
    function setStateIcoStarted() { currentState = State.IcoStarted; }
    function setStateIcoFinished() { currentState = State.IcoFinished; }
    function setStateAuctionStarted() { currentState = State.AuctionStarted; }
    function setStateAuctionFinished() { currentState = State.AuctionFinished; }
    function setTrivial() { trivial = msg.sender; }
    function setArtist() { artist = msg.sender; }
    function setIcoEndTime(uint256 time) { icoEndTime = time; }
    function setIcoEndTimeTenMinutes() { icoEndTime = now + 10 minutes; }
    function setAuctionEndTime(uint256 time) { auctionEndTime = time; }
    function setAuctionEndTimeTenMinutes() { auctionEndTime = now + 10 minutes; }
    function becomeKeyHolder() { balances[msg.sender] = safeDiv(tokensForIco, KEY_HOLDER_PART); }
}
