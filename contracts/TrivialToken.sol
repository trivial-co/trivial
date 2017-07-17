pragma solidity ^0.4.11;

import "./ERC223_Token.sol";

contract TrivialToken is ERC223Token {
    address artist;
    address trivial;
    uint256 public amountRaised;
    uint256 public icoEndTime;

    uint256 public totalSupply;
    uint256 public tokensForArtist;
    uint256 public tokensForTrivial;
    uint256 public tokensForIco;

    event IcoStarted();
    event IcoContributed(address contributor, uint256 amountContributed);
    event IcoFinished(uint256 amountRaised);

    enum State { Created, IcoStarted, IcoFinished }
    State currentState;

    mapping(address => uint) public contributions;
    address[] public contributors;

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

        for (uint i = 0; i < contributors.length; i++) {
            address currentContributor = contributors[i];
            balances[currentContributor] += safeDiv(
                safeMul(tokensForIco, contributions[currentContributor]),
                amountRaised, true
            );
        }
    }

    function checkContribution(address contributor) constant returns (uint) {
        return contributions[contributor];
    }

    function () payable {
        revert();
    }
}
