pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/payment/PullPayment.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./token/ERC223Token.sol";

contract TrivialToken is ERC223Token, PullPayment {

    //Constants
    uint8 constant DECIMALS = 0;
    uint256 constant MIN_ETH_AMOUNT = 0.01 ether;
    uint256 constant MIN_BID_PERCENTAGE = 5;
    uint256 constant TOTAL_SUPPLY = 1000000;
    uint256 constant TOKENS_PERCENTAGE_FOR_KEY_HOLDER = 5;

    //Private accounts
    address artist;
    address trivial;

    //Time information
    uint256 public icoEndTime;
    uint256 public auctionDuration;
    uint256 public auctionEndTime;

    //Token information
    uint256 public tokensForArtist;
    uint256 public tokensForTrivial;
    uint256 public tokensForIco;

    //ICO and auction results
    uint256 public amountRaised;
    address public highestBidder;
    uint256 public highestBid;

    //Events
    event IcoStarted(uint256 icoEndTime);
    event IcoContributed(address contributor, uint256 amountContributed, uint256 amountRaised);
    event IcoFinished(uint256 amountRaised);
    event AuctionStarted(uint256 auctionEndTime);
    event HighestBidChanged(address highestBidder, uint256 highestBid);
    event AuctionFinished(address highestBidder, uint256 highestBid);

    //State
    enum State { Created, IcoStarted, IcoFinished, AuctionStarted, AuctionFinished }
    State public currentState;

    //Token contributors and holders
    mapping(address => uint) public contributions;
    address[] public contributors;
    address[] public tokenHolders;

    //Modififers
    modifier onlyInState(State expectedState) { require(expectedState == currentState); _; }
    modifier onlyBefore(uint256 _time) { require(now < _time); _; }
    modifier onlyAfter(uint256 _time) { require(now > _time); _; }
    modifier onlyTrivial() { require(msg.sender == trivial); _; }
    modifier onlyKeyHolders() { require(balances[msg.sender] >= SafeMath.div(
        SafeMath.mul(tokensForIco, TOKENS_PERCENTAGE_FOR_KEY_HOLDER), 100)); _;
    }

    function TrivialToken(
        string _name, string _symbol,
        uint256 _icoEndTime, uint256 _auctionDuration,
        address _artist, address _trivial,
        uint256 _tokensForArtist,
        uint256 _tokensForTrivial,
        uint256 _tokensForIco
    ) {
        require(now < _icoEndTime);
        require(TOTAL_SUPPLY == _tokensForArtist + _tokensForTrivial + _tokensForIco);
        require(MIN_BID_PERCENTAGE < 100);
        require(TOKENS_PERCENTAGE_FOR_KEY_HOLDER < 100);

        name = _name;
        symbol = _symbol;
        decimals = DECIMALS;

        icoEndTime = _icoEndTime;
        auctionDuration = _auctionDuration;
        artist = _artist;
        trivial = _trivial;

        tokensForArtist = _tokensForArtist;
        tokensForTrivial = _tokensForTrivial;
        tokensForIco = _tokensForIco;

        currentState = State.Created;
    }

    /*
        ICO methods
    */
    function startIco()
    onlyInState(State.Created)
    onlyTrivial() {
        currentState = State.IcoStarted;
        IcoStarted(icoEndTime);
    }

    function contributeInIco() payable
    onlyInState(State.IcoStarted)
    onlyBefore(icoEndTime) {
        require(msg.value > MIN_ETH_AMOUNT);

        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        amountRaised += msg.value;

        IcoContributed(msg.sender, msg.value, amountRaised);
    }

    function finishIco()
    onlyInState(State.IcoStarted)
    onlyAfter(icoEndTime) {
        tokenHolders = contributors;

        currentState = State.IcoFinished;
        IcoFinished(amountRaised);

        distributeTokens();
        artist.transfer(this.balance);
    }

    function distributeTokens() private
    onlyInState(State.IcoFinished) {
        balances[artist] += tokensForArtist;
        balances[trivial] += tokensForTrivial;

        uint256 tokensForContributors = 0;
        for (uint i = 0; i < contributors.length; i++) {
            address currentContributor = contributors[i];
            uint256 tokensForContributor = SafeMath.div(
                SafeMath.mul(tokensForIco, contributions[currentContributor]),
                amountRaised
            );
            balances[currentContributor] += tokensForContributor;
            tokensForContributors += tokensForContributor;
        }

        uint256 leftovers = SafeMath.sub(tokensForIco, tokensForContributors);
        if (leftovers > 0) {
            balances[artist] += leftovers;
        }
    }

    function checkContribution(address contributor) constant returns (uint) {
        return contributions[contributor];
    }

    /*
        Auction methods
    */
    function startAuction()
    onlyInState(State.IcoFinished)
    onlyKeyHolders() {
        auctionEndTime = now + auctionDuration;

        currentState = State.AuctionStarted;
        AuctionStarted(auctionEndTime);
    }

    function bidInAuction() payable
    onlyInState(State.AuctionStarted)
    onlyBefore(auctionEndTime) {
        //Must be greater or equal to minimal amount
        require(msg.value >= MIN_ETH_AMOUNT);
        uint256 bid = calculateUserBid();

        //If there was a bid already
        if (highestBid >= MIN_ETH_AMOUNT) {
            //Must be greater or equal to 105% of previous bid
            uint256 minimalOverBid = SafeMath.add(highestBid, SafeMath.div(
                SafeMath.mul(highestBid, MIN_BID_PERCENTAGE), 100
            ));
            require(bid >= minimalOverBid);
            //Return to previous bidder his balance
            //Value to return: current balance - current bid
            uint256 amountToReturn = SafeMath.sub(
                this.balance, msg.value
            );
            highestBidder.transfer(amountToReturn);
            //TODO: Will issue that in branch TRIV-18
            //asyncSend(highestBidder, amountToReturn);
        }

        highestBidder = msg.sender;
        highestBid = bid;
        HighestBidChanged(highestBidder, highestBid);
    }

    function calculateUserBid() private returns (uint256) {
        uint256 bid = msg.value;
        uint256 contribution = balanceOf(msg.sender);
        if (contribution > 0) {
            //Formula: (sentETH * allTokens) / (allTokens - userTokens)
            //User sends 16ETH, has 40 of 200 tokens
            //(16 * 200) / (200 - 40) => 3200 / 160 => 20
            bid = SafeMath.div(
                SafeMath.mul(msg.value, TOTAL_SUPPLY),
                SafeMath.sub(TOTAL_SUPPLY, contribution)
            );
        }
        return bid;
    }

    function finishAuction()
    onlyInState(State.AuctionStarted)
    onlyAfter(auctionEndTime) {
        currentState = State.AuctionFinished;
        AuctionFinished(highestBidder, highestBid);

        withdrawAllShares();
    }

    function withdrawAllShares() private
    onlyInState(State.AuctionFinished) {
        withdrawShares(artist);
        withdrawShares(trivial);

        for (uint i = 0; i < tokenHolders.length; i++) {
            address holder = tokenHolders[i];
            if (balanceOf(holder) > 0) {
                withdrawShares(holder);
            }
        }
        artist.transfer(this.balance);
    }

    function withdrawShares(address holder) private
    onlyInState(State.AuctionFinished) {
        uint256 availableTokens = balances[holder];
        require(availableTokens > 0);
        balances[holder] = 0;

        if (holder != highestBidder) {
            holder.transfer(
                SafeMath.div(SafeMath.mul(highestBid, availableTokens), TOTAL_SUPPLY)
            );
        }
    }

    function isKeyHolder(address person) constant returns (bool) {
        return balances[person] >= SafeMath.div(tokensForIco, TOKENS_PERCENTAGE_FOR_KEY_HOLDER); }

    /*
        End methods
    */
    function killContract()
    onlyInState(State.AuctionFinished)
    onlyTrivial() {
        selfdestruct(trivial);
    }

    /*
        General methods
    */

    // helper function to avoid too many contract calls on frontend side
    function getContractState() constant returns (
        uint256, uint256, uint256, uint256, uint256,
        uint256, uint256, address, uint256, State,
        uint256, uint256
    ) {
        return (
            icoEndTime, auctionDuration, auctionEndTime,
            tokensForArtist, tokensForTrivial, tokensForIco,
            amountRaised, highestBidder, highestBid, currentState,
            TOKENS_PERCENTAGE_FOR_KEY_HOLDER, MIN_BID_PERCENTAGE
        );
    }

    function transfer(address _to, uint _value, bytes _data) returns (bool success) {
        success = ERC223Token.transfer(_to, _value, _data);
        if (success) {
            tokenHolders.push(_to);
        }
        return success;
    }

    function transfer(address _to, uint _value) returns (bool success) {
        bytes memory empty;
        return transfer(_to, _value, empty);
    }

    function () payable {
        revert();
    }
}
