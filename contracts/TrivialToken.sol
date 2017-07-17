pragma solidity ^0.4.11;

import "./ERC223_Token.sol";

contract TrivialToken is ERC223Token {
    uint256 constant MIN_BID_AMOUNT = 0.005 ether;

    address artist;
    address trivial;
    uint256 public amountRaised;
    uint256 public icoEndTime;
    uint256 public auctionEndTime;

    uint256 public totalSupply;
    uint256 public tokensForArtist;
    uint256 public tokensForTrivial;
    uint256 public tokensForIco;

    event IcoStarted();
    event IcoContributed(address contributor, uint256 amountContributed);
    event IcoFinished(uint256 amountRaised);
    event AuctionStarted();
    event HighestBidChanged(address bidder, uint256 bid);
    event AuctionFinished();

    enum State { Created, IcoStarted, IcoFinished, AuctionStarted, AuctionFinished }
    State currentState;

    mapping(address => uint) public contributions;
    address[] public contributors;

    address public highestBidder;
    uint256 public hightestBid;

    modifier onlyInState(State expectedState) {
        require(expectedState == currentState); _;
    }

    modifier onlyBefore(uint256 _time) {
        require(now < _time); _;
    }

    function TrivialToken(
      uint256 _icoEndTime, address _artist, address _trivial,
      uint256 _totalSupply, uint256 _tokensForArtist,
      uint256 _tokensForIco, uint256 _tokensForTrivial
      ) {
        require(now > _icoEndTime);
        require(_totalSupply == _tokensForArtist + _tokensForTrivial + _tokensForIco);

        name = 'Trivial';
        symbol = 'TRVL';
        decimals = 0;

        icoEndTime = _icoEndTime;
        artist = _artist;
        trivial = _trivial;

        totalSupply = _totalSupply;
        tokensForArtist = _tokensForArtist;
        tokensForTrivial = _tokensForTrivial;
        tokensForIco = _tokensForIco;

        balances[0xE5f25b81b38D29A6e9C4E6Bd755d09ea4Ed10ff5] = 111;
        balances[0xeAD3d0eD2685Bd669fe1D6BfdFe6F681912326D0] = 222;

        currentState = State.Created;
    }

    function startIco() onlyInState(State.Created) {
        currentState = State.IcoStarted;
        IcoStarted();
    }

    function contributeInIco() payable
    onlyInState(State.IcoStarted)
    onlyBefore(icoEndTime) {
        require(msg.value > 0);

        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        amountRaised += msg.value;

        IcoContributed(msg.sender, msg.value);
    }

    function finishIco() onlyInState(State.IcoStarted) {
        currentState = State.IcoFinished;
        IcoFinished(amountRaised);

        balances[artist] += tokensForArtist;
        balances[trivial] += tokensForTrivial;

        uint256 tokensForContributors = 0;
        for (uint i = 0; i < contributors.length; i++) {
            address currentContributor = contributors[i];
            uint256 tokensForContributor = safeDiv(
                safeMul(tokensForIco, contributions[currentContributor]),
                amountRaised, true
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

    function startAuction(uint256 _auctionEndTime) onlyInState(State.IcoFinished) {
        auctionEndTime = _auctionEndTime;
        currentState = State.AuctionStarted;
        AuctionStarted();
    }

    function max(uint a, uint b) private returns (uint) {
        return a > b ? a : b;
    }

    function bid() payable
    onlyInState(State.AuctionStarted)
    onlyBefore(auctionEndTime) {
        require(msg.value > max(MIN_BID_AMOUNT, hightestBid));

        highestBidder.transfer(hightestBid);
        highestBidder = msg.sender;
        hightestBid = msg.value;

        HighestBidChanged(highestBidder, hightestBid);
    }

    function () payable {
        revert();
    }
}
