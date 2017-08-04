pragma solidity ^0.4.11;

import "../interface/v102/V102.sol";
import "../TrivialToken.sol";

contract TrivialTokenUpgrade is TrivialToken {
    function TrivialTokenUpgrade(
        address _tokenAddress,
        string _name, string __symbol,
        bytes32 _descriptionHash,
        uint256 _contributorsCount
    ) payable {
        V102 originContract = V102(_tokenAddress);

        // General
        name = _name;
        symbol = 'TRT';
        decimals = originContract.decimals();

        // Accounts
        artist = originContract.artist();
        trivial = originContract.trivial();

        // Token count
        tokensForArtist = originContract.tokensForArtist();
        tokensForTrivial = originContract.tokensForTrivial();
        tokensForIco = originContract.tokensForIco();

        // Upgrade v1.02 to v1.03
        descriptionHash = DescriptionHash(_descriptionHash, now);

        State originState = originContract.currentState();
        bool isStarted = originState == State.IcoStarted;

        // Upgrades contract only though ICO
        /*require(isStarted);*/
        upgradeStartIco();
        upgradeContributeInIco(originContract, _contributorsCount);

        // Synchronize rest
        icoEndTime = originContract.icoEndTime();
        auctionDuration = originContract.auctionDuration();
        auctionEndTime = originContract.auctionEndTime();
        highestBidder = originContract.highestBidder();
        highestBid = originContract.highestBid();
        auctionWinnerMessageHash = originContract.auctionWinnerMessageHash();
        nextContributorIndexToBeGivenTokens = originContract.nextContributorIndexToBeGivenTokens();
        tokensDistributedToContributors = originContract.tokensDistributedToContributors();

        // Assert amount is the same
        /*require(currentState == originState);
        require(amountRaised == originContract.amountRaised());*/
    }

    function upgradeStartIco() private {
        currentState = State.IcoStarted;
        IcoStarted(icoEndTime);
    }

    function upgradeContributeInIco(V102 originContract, uint256 _contributorsCount) private {
        // ICO contributors
        for (uint256 i; i < _contributorsCount; i++) {
            address contributor = originContract.contributors(i);
            uint256 contribution = originContract.contributions(contributor);

            if (contributions[msg.sender] == 0) {
                contributors.push(msg.sender);
            }

            contributions[contributor] = SafeMath.add(contributions[contributor], contribution);
            amountRaised = SafeMath.add(amountRaised, contribution);
            IcoContributed(contributor, contribution, amountRaised);
        }
    }
}
