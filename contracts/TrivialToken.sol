pragma solidity ^0.4.11;

import "./ERC223_Token.sol";

contract TrivialToken is ERC223Token {
    uint256 constant MIN_ETH_AMOUNT = 0.01 ether;

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
    event AuctionStarted(uint256 auctionTime);
    event HighestBidChanged(address bidder, uint256 bid);
    event AuctionFinished(address bidder, uint256 bid);
    event SharesWithdrawal(address contributor, uint256 tokens);

    enum State { Created, IcoStarted, IcoFinished, AuctionStarted, AuctionFinished }
    State currentState;

    mapping(address => uint) public contributions;
    address[] public contributors;

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
        require(msg.value > MIN_ETH_AMOUNT);

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

    function startAuction(uint256 _auctionEndTime)
    onlyInState(State.IcoFinished) {
        auctionEndTime = _auctionEndTime;
        currentState = State.AuctionStarted;
        AuctionStarted(_auctionEndTime);
    }

    function max(uint a, uint b) private returns (uint) {
        return a > b ? a : b;
    }

    function bidInAuction() payable
    onlyInState(State.AuctionStarted)
    onlyBefore(auctionEndTime) {
        require(msg.value >= max(MIN_ETH_AMOUNT, highestBid + MIN_ETH_AMOUNT));

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

        //TODO: If withdrawal will not be implemented on frontend
        // Than uncomment line below:
        //widthdrawAllShares()
    }

    function widthdrawAllShares() private
    onlyInState(State.AuctionFinished) {
        widthdrawShares(artist);
        widthdrawShares(trivial);

        for (uint i = 0; i < contributors.length; i++) {
            widthdrawShares(contributors[i]);
        }
    }

    function widthdrawShares(address contributor)
    onlyInState(State.AuctionFinished) {
        uint256 availableTokens = balances[contributor];
        require(availableTokens > 0);
        balances[contributor] = 0;

        contributor.transfer(
            safeDiv(safeMul(highestBid, availableTokens), totalSupply)
        );

        //TODO: If withdrawal will not be implemented on frontend
        // Than comment line below and make this a private function:
        SharesWithdrawal(contributor, availableTokens);
    }

    function () payable {
        revert();
    }
}
