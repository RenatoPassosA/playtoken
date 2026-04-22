// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title PlayToken management
/// @author RenatoP
/// @notice ERC-20 token with owner-controlled minting and pause functionality
/// @dev Simple contract without advanced resources built on OpenZeppelin ERC20, Ownable, and Pausable
contract PlayToken is ERC20, Ownable, Pausable {
    /// @dev Thrown when a zero address is provided where a valid address is required
    error ZeroAddress();

    /// @notice Deploys the token contract and mints the initial supply to the deployer
    /// @dev The initial supply is minted in the smallest unit of the token
    /// @param initialSupply Initial amount of tokens to mint to the deployer
    constructor(uint256 initialSupply) ERC20("PlayToken", "PLAY") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    /// @notice Mints new tokens to a given address
    /// @dev Only the contract owner can call this function
    /// @param amount amount of token to mint, expressed in the smallest unit
    /// @param to Address that will receive the minted tokens
    function mint(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        _mint(to, amount);
    }

    /// @notice Pauses token transfers and other balance-updating operations
    /// @dev Only the contract owner can pause the token
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpauses token transfers and other balance-updating operations
    /// @dev Only the contract owner can unpause the token
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Centralized logic for all the token balance updates - including transfers, minting, and burning
    /// @param from Address tokens are moved from
    /// @param to Address tokens are moved to
    /// @param value Amount of tokens involved in the operation
    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }
}