import "./ERC223_Token.sol";

contract TrivialToken is ERC223Token {

  uint256 public amountRaised;
  uint256 public tokensForIco;
  uint256 public tokensForArtist;
  uint256 public tokensForTrivial;
  uint256 public icoEndTime;

  event FirstAuctionStarted();
  event FirstAuctionContributed(address contributor, uint256 amountContributed);
  event FirstAuctionFinished(uint256 amountRaised);

  enum State {Created, FirstAuctionStarted, FirstAuctionFinished};
  State currentState;

  mapping(address => uint) public contributors;

  modifier onlyInState(State expectedState) {
    require(expectedState == currentState); _;
  }

  modifier onlyBefore(uint256 _time) {
    require(now < _time); _;
  }

  function TrivialToken(uint256 _icoEndTime) {
    name = 'Trivial';
    symbol = 'TRVL';
    decimals = 3;
    totalSupply = 1000;
    balances[0xE5f25b81b38D29A6e9C4E6Bd755d09ea4Ed10ff5] = 111;
    balances[0xeAD3d0eD2685Bd669fe1D6BfdFe6F681912326D0] = 222;

    icoGoal = _icoEndTime;
    currentState = State.Created;
  }

  function startFirstAuction() onlyInState(State.Created) {
    currentState = State.FirstAuctionStarted;
    FirstAuctionStarted();
  }

  function contributeInIco() payable
  onlyInState(State.FirstAuctionStarted)
  onlyBefore(icoEndTime) {
    require(msg.value);

    contributors[msg.sender] += msg.value;
    amountRaised += msg.value;

    FirstAuctionContributed(msg.sender, msg.value)
  }
}
