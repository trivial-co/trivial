import "./ERC223_Token.sol";

contract TrivialToken is ERC223Token {
  function TrivialToken() {
        name = 'Trivial';
        symbol = 'TRVL';
        decimals = 3;
        totalSupply = 1000;
        balances[0xE5f25b81b38D29A6e9C4E6Bd755d09ea4Ed10ff5] = 100;
        balances[0xeAD3d0eD2685Bd669fe1D6BfdFe6F681912326D0] = 100;
    }
}
