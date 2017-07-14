import "./ERC223_Token.sol";

contract TrivialToken is ERC223Token {

  uint256 public amountRaised;
  uint256 public tokensForIco;
  uint256 public tokensForArtist;
  uint256 public tokensForTrivial;
  uint256 public icoGoal;

  event FirstAuctionStarted();
  event FirstAuctionFinished(amountRaised);

  enum State {Created, FirstAuctionStarted, FirstAuctionFinished};
  State currentState;

  mapping(address => uint) public contributors;

  modifier onlyInState(State expectedState) {
    require(expectedState == currentState); _;
  }

  function TrivialToken(uint256 _icoGoal) {
    name = 'Trivial';
    symbol = 'TRVL';
    decimals = 3;
    totalSupply = 1000;
    balances[0xE5f25b81b38D29A6e9C4E6Bd755d09ea4Ed10ff5] = 111;
    balances[0xeAD3d0eD2685Bd669fe1D6BfdFe6F681912326D0] = 222;

    icoGoal = _icoGoal;
    currentState = State.Created;
  }

  function startFirstAuction() onlyInState(State.Created) {
    currentState = State.FirstAuctionStarted;
    FirstAuctionStarted(goal);
  }

  function contributeInIco() payable onlyInState(State.FirstAuctionStarted) {
    require(msg.value);

    contributors[msg.sender] += msg.value;
    amountRaised += msg.value;

    if (amountRaised >= icoGoal) {
      currentState = State.FirstAuctionFinished;
      FirstAuctionFinished(amountRaised);
    }

    /*
      Reward contributor with amount of tokens equal to amount of sended eth.
      Called at the end to ensure that gas error will not break it.
      TODO: Could we use send here instead of balances?
    */
    balances[msg.sender] += msg.value;
  }
}
