pragma solidity ^0.4.11;

import "./interface/ERC223TokenInterface.sol";
import "./TrivialToken.sol";

contract TrivialTokenInterfaceV102 is ERC223TokenInterface {
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

    //State
    enum State { Created, IcoStarted, IcoFinished, AuctionStarted, AuctionFinished, IcoCancelled }
    State public currentState;

    //Token contributors and holders
    mapping(address => uint) public contributions;
    address[] public contributors;
}


contract TrivialTokenUpgrade is TrivialToken {
    function TrivialTokenUpgrade(address _tokenAddress, bytes32 _descriptionHash) payable {
        TrivialTokenInterfaceV102 originContract = TrivialTokenInterfaceV102(_tokenAddress);

        // General
        name = originContract.name;
        symbol = originContract.symbol;
        decimals = originContract.decimals;

        // Basic
        icoEndTime = originContract.icoEndTime;
        auctionDuration = originContract.auctionDuration;
        auctionEndTime = originContract.auctionEndTime;
        artist = originContract.artist;
        trivial = originContract.trivial;

        // Token count
        tokensForArtist = originContract.tokensForArtist;
        tokensForTrivial = originContract.tokensForTrivial;
        tokensForIco = originContract.tokensForIco;

        // ICO and Auction generated
        amountRaised = originContract.amountRaised;
        highestBidder = originContract.highestBidder;
        highestBid = originContract.highestBid;
        auctionWinnerMessageHash = originContract.auctionWinnerMessageHash;
        nextContributorIndexToBeGivenTokens = originContract.nextContributorIndexToBeGivenTokens;
        tokensDistributedToContributors = originContract.tokensDistributedToContributors;

        // ICO contributors
        contributions = originContract.contributions;
        contributors = originContract.contributors;

        // State
        currentState = originContract.currentState;

        descriptionHash = DescriptionHash(_descriptionHash, now);
    }
}
