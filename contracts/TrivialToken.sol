pragma solidity ^0.4.11;

import "./ERC223_Token.sol";

contract TrivialToken is ERC223Token {
    uint256 constant MIN_ETH_AMOUNT = 0.01 ether;
    uint256 constant TOTAL_SUPPLY = 1000000;

    address artist;
    address trivial;
    uint256 public amountRaised;
    uint256 public icoEndTime;
    uint256 public auctionDuration;
    uint256 public auctionEndTime;

    uint256 public tokensForArtist;
    uint256 public tokensForTrivial;
    uint256 public tokensForIco;

    event IcoStarted();
    event IcoContributed(address contributor, uint256 amountContributed);
    event IcoFinished(uint256 amountRaised);
    event AuctionStarted(uint256 auctionTime);
    event HighestBidChanged(address bidder, uint256 bid);
    event AuctionFinished(address bidder, uint256 bid);

    enum State { Created, IcoStarted, IcoFinished, AuctionStarted, AuctionFinished }
    State public currentState;

    mapping(address => uint) public contributions;
    address[] public contributors;

    address[] tokenHolders;

    address public highestBidder;
    uint256 public highestBid;

    modifier onlyInState(State expectedState) {
        require(expectedState == currentState); _;
    }

    modifier onlyBefore(uint256 _time) {
        require(now < _time); _;
    }

    modifier onlyAfter(uint256 _time) {
        require(now > _time); _;
    }

    function TrivialToken(
        uint256 _icoEndTime, uint256 _auctionDuration,
        address _artist, address _trivial,
        uint256 _tokensForArtist,
        uint256 _tokensForTrivial,
        uint256 _tokensForIco
    ) {
        require(now < _icoEndTime);
        require(TOTAL_SUPPLY == _tokensForArtist + _tokensForTrivial + _tokensForIco);

        name = 'Trivial';
        symbol = 'TRVL';
        decimals = 0;

        icoEndTime = _icoEndTime;
        auctionDuration = _auctionDuration;
        artist = _artist;
        trivial = _trivial;

        tokensForArtist = _tokensForArtist;
        tokensForTrivial = _tokensForTrivial;
        tokensForIco = _tokensForIco;

        currentState = State.Created;
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

    function startIco() onlyInState(State.Created) {
        currentState = State.IcoStarted;
        IcoStarted();
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

        IcoContributed(msg.sender, msg.value);
    }

    function finishIco() onlyInState(State.IcoStarted) {
        //tokenHolders = contributors;
        currentState = State.IcoFinished;
        IcoFinished(amountRaised);

        balances[artist] += tokensForArtist;
        balances[trivial] += tokensForTrivial;

        uint256 tokensForContributors = 0;
        for (uint i = 0; i < contributors.length; i++) {
            address currentContributor = contributors[i];
            uint256 tokensForContributor = safeDiv(
                safeMul(tokensForIco, contributions[currentContributor]),
                amountRaised
            );
            balances[currentContributor] += tokensForContributor;
            tokensForContributors += tokensForContributor;
        }

        uint256 leftovers = safeSub(tokensForIco, tokensForContributors);
        if (leftovers > 0) {
            balances[artist] += leftovers;
        }
    }

    function checkContribution(address contributor) constant returns (uint) {
        return contributions[contributor];
    }

    function startAuction()
    onlyInState(State.IcoFinished) {
        auctionEndTime = now + auctionDuration;

        currentState = State.AuctionStarted;
        AuctionStarted(auctionEndTime);
    }

    function bidInAuction() payable
    onlyInState(State.AuctionStarted)
    onlyBefore(auctionEndTime) {
        require(msg.value >= highestBid + MIN_ETH_AMOUNT);

        highestBidder.transfer(highestBid);
        highestBidder = msg.sender;
        highestBid = msg.value;

        HighestBidChanged(highestBidder, highestBid);
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

        holder.transfer(
            safeDiv(safeMul(highestBid, availableTokens), TOTAL_SUPPLY)
        );
    }

    function () payable {
        revert();
    }
}
