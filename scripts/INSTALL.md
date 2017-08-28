# Alternative deployment scripts

Based on http://solidity.readthedocs.io/en/develop/installing-solidity.html#binary-packages

## Install solidity compiler

For Ubuntu:

    sudo add-apt-repository ppa:ethereum/ethereum
    sudo apt-get update
    sudo apt-get install solc

For OSX:

    brew update
    brew upgrade
    brew tap ethereum/ethereum
    brew install solidity
    brew linkapps solidity
