// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;


import "./openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./openzeppelin/contracts/access/Ownable.sol";

contract MockERC20 is ERC20,Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 supply
    ) public ERC20(name, symbol) {
        _mint(msg.sender, supply);
    }
    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
    function burn(address _account, uint256 _amount) public onlyOwner {
        _burn(_account, _amount);
    }    
}