// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockEntrypoint {
    event Deposited(
        address indexed _depositor,
        address indexed _pool,
        uint256 _commitment,
        uint256 _amount
    );

    // Matches Privacy Pools V1 deposit structure: deposit(tokenAddress, amount, precommitment)
    function deposit(
        address tokenAddress,
        uint256 amount,
        uint256 precommitment
    ) external {
        require(amount > 0, "Amount must be greater than zero");
        
        // Transfer ERC20 tokens from the sender to this contract
        bool success = IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        require(success, "Token transfer failed");

        // The precommitment is used as the commitment index
        emit Deposited(msg.sender, address(this), precommitment, amount);
    }
}
