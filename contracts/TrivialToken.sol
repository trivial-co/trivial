import "./ERC223_Token.sol";

contract TrivialToken is ERC223Token {

  uint256 public amountRaised;
  uint256 public tokensForIco;
  uint256 public tokensForArtist;
  uint256 public tokensForTrivial;
  uint256 public IcoGoal;

  enum State {Created, FirstAuctionStarted, FirstAuctionFinished};
  State currentState;
  modifier onlyInState(GameState expectedState) {
    require(expectedState == currentState)
    _;
  }

  function TrivialToken(uint256 _icoGoal) {
    currentState = State.Created;
    name = 'Trivial';
    symbol = 'TRVL';
    decimals = 3;
    totalSupply = 1000;
    balances[0xE5f25b81b38D29A6e9C4E6Bd755d09ea4Ed10ff5] = 100;
    balances[0xeAD3d0eD2685Bd669fe1D6BfdFe6F681912326D0] = 100;
  }

  function startFirstAuction() onlyInState(State.Created) {

  }

  function contributeInIco() onlyInState(State.FirstAuctionStarted) {
    
  }
}
