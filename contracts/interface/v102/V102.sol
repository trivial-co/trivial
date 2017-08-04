pragma solidity ^0.4.11;

contract V102 {
    //Basic
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    //Accounts
    address public artist;
    address public trivial;

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
    bytes32 public auctionWinnerMessageHash;
    uint256 public nextContributorIndexToBeGivenTokens;
    uint256 public tokensDistributedToContributors;

    //Events
    event IcoStarted(uint256 icoEndTime);
    event IcoContributed(address contributor, uint256 amountContributed, uint256 amountRaised);
    event IcoFinished(uint256 amountRaised);
    event IcoCancelled();
    event AuctionStarted(uint256 auctionEndTime);
    event HighestBidChanged(address highestBidder, uint256 highestBid);
    event AuctionFinished(address highestBidder, uint256 highestBid);
    event WinnerProvidedHash();

    //State
    enum State { Created, IcoStarted, IcoFinished, AuctionStarted, AuctionFinished, IcoCancelled }
    State public currentState;

    //Token contributors and holders
    mapping(address => uint) public contributions;
    address[] public contributors;
}
