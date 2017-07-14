pragma solidity ^0.4.11;

import "./ERC223_Token.sol";

contract TrivialToken is ERC223Token {
  address artist;
  address trivial;

  uint256 public amountRaised;
  uint256 public icoEndTime;

  uint256 public constant initialTokenAmount = 1000;
  uint256 public constant tokensForArtist = 200;
  uint256 public constant tokensForTrivial = 100;
  uint256 public constant tokensForIco = 700;

  uint8 _decimals = 3;
  uint256 floatingPoint = 10 * _decimals;

  event FirstAuctionStarted();
  event FirstAuctionContributed(address contributor, uint256 amountContributed);
  event FirstAuctionFinished(uint256 amountRaised);

  enum State { Created, FirstAuctionStarted, FirstAuctionFinished }
  State currentState;

  mapping(address => uint) public contributions;
  address[] public contributors;

  modifier onlyInState(State expectedState) {
    require(expectedState == currentState); _;
  }

  modifier onlyBefore(uint256 _time) {
    require(now < _time); _;
  }

  function TrivialToken(uint256 _icoEndTime, address _artist, address _trivial) {
    name = 'Trivial';
    symbol = 'TRVL';
    decimals = _decimals;
    totalSupply = 1000;
    balances[0xE5f25b81b38D29A6e9C4E6Bd755d09ea4Ed10ff5] = 111;
    balances[0xeAD3d0eD2685Bd669fe1D6BfdFe6F681912326D0] = 222;

    icoEndTime = _icoEndTime;
    artist = _artist;
    trivial = _trivial;
    currentState = State.Created;
  }

  function startFirstAuction() onlyInState(State.Created) {
    currentState = State.FirstAuctionStarted;
    FirstAuctionStarted();
  }

  function contributeInIco() payable
  onlyInState(State.FirstAuctionStarted)
  onlyBefore(icoEndTime) {
    require(msg.value > 0);

    if (contributions[msg.sender] == 0) {
      contributors.push(msg.sender);
    }
    contributions[msg.sender] += msg.value;
    amountRaised += msg.value;

    FirstAuctionContributed(msg.sender, msg.value);
  }

  function finishFirstAuction() onlyInState(State.FirstAuctionStarted) {
    currentState = State.FirstAuctionFinished;
    FirstAuctionFinished(amountRaised);

    balances[artist] += tokensForArtist;
    balances[trivial] += tokensForTrivial;

    for (uint i = 0; i < contributors.length; i++) {
      address currentContributor = contributors[i];
      balances[currentContributor] += safeMul(
          safeDiv(
            safeMul(tokensForIco, contributions[currentContributor]),
            amountRaised, true
          ),
          floatingPoint
        );
    }
  }

  function () payable {
    contributeInIco();
  }
}
