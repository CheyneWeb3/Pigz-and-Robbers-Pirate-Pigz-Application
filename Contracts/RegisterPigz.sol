// SPDX-License-Identifier: MIT

// Readme Cosmic
/*

# PiratePigzNFTRegistration Smart Contract

## Overview

The `NFTRegistration` smart contract allows users to register NFTs with specific traits, claim rewards for having a valid combination of traits, and manage various administrative tasks.

## User Guide

### Registering an NFT

1. **Function**: `registerNFT`
   - **Description**: Register an NFT with a specific trait.
   - **Parameters**:
     - `tokenId`: The unique identifier of the NFT.
     - `trait`: The trait associated with the NFT.
   - **Usage**:
     ```solidity
     registerNFT(uint256 tokenId, string memory trait)
     ```
   - **Example**:
     ```solidity
     contractInstance.registerNFT(123, "Pirate Ship");
     ```

2. **Conditions**:
   - The `tokenId` must be less than or equal to 511.
   - The NFT must not be already registered by the same user.

### Claiming Rewards

1. **Function**: `claimReward`
   - **Description**: Claim a reward if the user has a valid combination of traits (Pirate Ship, Tavern, Island).
   - **Conditions**:
     - Claiming must be enabled by the contract owner.
     - The user must have at least one of each trait (Pirate Ship, Tavern, Island).
   - **Usage**:
     ```solidity
     claimReward()
     ```

2. **Example**:
   ```solidity
   contractInstance.claimReward();
   ```

### Viewing Registered NFTs

1. **Function**: `getNFTsByOwner`
   - **Description**: Get a list of registered NFTs by a specific owner.
   - **Parameters**:
     - `user`: The address of the owner.
   - **Usage**:
     ```solidity
     getNFTsByOwner(address user)
     ```
   - **Example**:
     ```solidity
     contractInstance.getNFTsByOwner(userAddress);
     ```

2. **Function**: `getRegisteredNFTs`
   - **Description**: Get a list of all registered NFTs.
   - **Usage**:
     ```solidity
     getRegisteredNFTs()
     ```
   - **Example**:
     ```solidity
     contractInstance.getRegisteredNFTs();
     ```

### Checking Claim Values

1. **Function**: `getTotalClaimValue`
   - **Description**: Get the total reward value for all users with valid claims.
   - **Usage**:
     ```solidity
     getTotalClaimValue()
     ```
   - **Example**:
     ```solidity
     contractInstance.getTotalClaimValue();
     ```

2. **Function**: `getClaimValueByUser`
   - **Description**: Get the reward value for a specific user with valid claims.
   - **Parameters**:
     - `user`: The address of the user.
   - **Usage**:
     ```solidity
     getClaimValueByUser(address user)
     ```
   - **Example**:
     ```solidity
     contractInstance.getClaimValueByUser(userAddress);
     ```

## Contract Details

### State Variables

- `nftTraits`: Maps an owner's address and token ID to the NFT's trait.
- `ownerNFTs`: Maps an owner's address to a list of their token IDs.
- `registeredNFTs`: Maps a token ID to the NFT's details (tokenId, owner, trait).
- `registeredTokenIds`: Array of all registered token IDs.
- `REWARD_PER_CLAIM`: The reward amount per valid claim.
- `MAX_TOKEN_ID`: The maximum token ID allowed.
- `owner`: The address of the contract owner.
- `claimingEnabled`: A flag indicating if claiming is enabled.

### Events

- `NFTRegistered`: Emitted when an NFT is registered.
- `RewardClaimed`: Emitted when a reward is claimed.
- `ClaimingEnabled`: Emitted when claiming is enabled or disabled.
- `OwnershipTransferred`: Emitted when ownership is transferred.

### Modifiers

- `onlyOwner`: Ensures that only the contract owner can call the function.

### Functions

1. **Constructor**
   - Sets the contract deployer as the initial owner.

2. **registerNFT**
   - Registers an NFT with a specific trait for the caller.

3. **hasValidClaim**
   - Checks if a user has a valid combination of traits (Pirate Ship, Tavern, Island).

4. **enableClaiming**
   - Enables or disables claiming. Can only be called by the owner.

5. **claimReward**
   - Allows users with valid claims to claim their rewards.

6. **getNFTsByOwner**
   - Returns a list of NFT token IDs owned by a specific user.

7. **getRegisteredNFTs**
   - Returns a list of all registered NFTs.

8. **getTotalClaimValue**
   - Calculates the total reward value for all users with valid claims.

9. **getClaimValueByUser**
   - Calculates the reward value for a specific user with valid claims.

10. **transferOwnership**
    - Transfers contract ownership to a new owner.

11. **recoverERC20**
    - Allows the owner to recover ERC20 tokens sent to the contract.

12. **receive**
    - Allows the contract to receive Ether.

13. **fallback**
    - Fallback function to handle unexpected calls.

### Example Interaction

```solidity
// Register an NFT
contractInstance.registerNFT(1, "Pirate Ship");
contractInstance.registerNFT(2, "Tavern");
contractInstance.registerNFT(3, "Island");

// Enable claiming
contractInstance.enableClaiming(true);

// Claim reward
contractInstance.claimReward();
```


*/




pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract NFTRegistration {
    struct NFT {
        uint256 tokenId;
        address owner;
        string trait;
    }

    mapping(address => mapping(uint256 => string)) public nftTraits;
    mapping(address => uint256[]) public ownerNFTs;
    mapping(uint256 => NFT) public registeredNFTs;
    uint256[] public registeredTokenIds;

    uint256 public constant REWARD_PER_CLAIM = 20 * 1e18;
    uint256 public constant MAX_TOKEN_ID = 511;
    address public owner;
    bool public claimingEnabled = false;

    event NFTRegistered(address indexed owner, uint256 indexed tokenId, string trait);
    event RewardClaimed(address indexed owner, uint256 rewardAmount);
    event ClaimingEnabled(bool enabled);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerNFT(uint256 tokenId, string memory trait) public {
        require(tokenId <= MAX_TOKEN_ID, "Token ID exceeds maximum limit");
        require(bytes(nftTraits[msg.sender][tokenId]).length == 0, "NFT already registered");

        nftTraits[msg.sender][tokenId] = trait;
        ownerNFTs[msg.sender].push(tokenId);
        registeredNFTs[tokenId] = NFT(tokenId, msg.sender, trait);
        registeredTokenIds.push(tokenId);

        emit NFTRegistered(msg.sender, tokenId, trait);
    }

    function hasValidClaim(address user) public view returns (bool) {
        uint256 pirateShipCount = 0;
        uint256 tavernCount = 0;
        uint256 islandCount = 0;
        uint256 treasureChestCount = 0;
        uint256 marketCount = 0;

        uint256[] memory tokens = ownerNFTs[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            string memory trait = nftTraits[user][tokens[i]];
            if (keccak256(bytes(trait)) == keccak256(bytes("Pirate Ship"))) {
                pirateShipCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Tavern"))) {
                tavernCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Island"))) {
                islandCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Treasure Chest"))) {
                treasureChestCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Market"))) {
                marketCount++;
            }
        }

        return pirateShipCount > 0 && tavernCount > 0 && islandCount > 0 && treasureChestCount > 0 && marketCount > 0;
    }

    function claimReward() public {
        require(claimingEnabled, "Claiming is not enabled");
        require(hasValidClaim(msg.sender), "No valid claim");

        uint256 claimCount = 0;
        uint256 pirateShipCount = 0;
        uint256 tavernCount = 0;
        uint256 islandCount = 0;
        uint256 treasureChestCount = 0;
        uint256 marketCount = 0;

        uint256[] memory tokens = ownerNFTs[msg.sender];
        for (uint256 i = 0; i < tokens.length; i++) {
            string memory trait = nftTraits[msg.sender][tokens[i]];
            if (keccak256(bytes(trait)) == keccak256(bytes("Pirate Ship"))) {
                pirateShipCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Tavern"))) {
                tavernCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Island"))) {
                islandCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Treasure Chest"))) {
                treasureChestCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Market"))) {
                marketCount++;
            }

            if (pirateShipCount > 0 && tavernCount > 0 && islandCount > 0 && treasureChestCount > 0 && marketCount > 0) {
                claimCount++;
                pirateShipCount--;
                tavernCount--;
                islandCount--;
                treasureChestCount--;
                marketCount--;
            }
        }

        require(claimCount > 0, "No full sets found");

        uint256 rewardAmount = claimCount * REWARD_PER_CLAIM;
        payable(msg.sender).transfer(rewardAmount);

        emit RewardClaimed(msg.sender, rewardAmount);
    }

    function getNFTsByOwner(address user) public view returns (uint256[] memory) {
        return ownerNFTs[user];
    }

    function getRegisteredNFTs() public view returns (NFT[] memory) {
        uint256 totalNFTs = registeredTokenIds.length;
        NFT[] memory nfts = new NFT[](totalNFTs);

        for (uint256 i = 0; i < totalNFTs; i++) {
            nfts[i] = registeredNFTs[registeredTokenIds[i]];
        }

        return nfts;
    }

    function getTotalClaimValue() public view returns (uint256) {
        uint256 totalClaims = 0;
        for (uint256 i = 0; i < registeredTokenIds.length; i++) {
            address owner = registeredNFTs[registeredTokenIds[i]].owner;
            if (hasValidClaim(owner)) {
                totalClaims++;
            }
        }
        return totalClaims * REWARD_PER_CLAIM;
    }

    function getClaimValueByUser(address user) public view returns (uint256) {
        if (!hasValidClaim(user)) {
            return 0;
        }

        uint256 claimCount = 0;
        uint256 pirateShipCount = 0;
        uint256 tavernCount = 0;
        uint256 islandCount = 0;
        uint256 treasureChestCount = 0;
        uint256 marketCount = 0;

        uint256[] memory tokens = ownerNFTs[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            string memory trait = nftTraits[user][tokens[i]];
            if (keccak256(bytes(trait)) == keccak256(bytes("Pirate Ship"))) {
                pirateShipCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Tavern"))) {
                tavernCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Island"))) {
                islandCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Treasure Chest"))) {
                treasureChestCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Market"))) {
                marketCount++;
            }

            if (pirateShipCount > 0 && tavernCount > 0 && islandCount > 0 && treasureChestCount > 0 && marketCount > 0) {
                claimCount++;
                pirateShipCount--;
                tavernCount--;
                islandCount--;
                treasureChestCount--;
                marketCount--;
            }
        }

        return claimCount * REWARD_PER_CLAIM;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function recoverERC20(address tokenAddress, uint256 tokenAmount) public onlyOwner {
        IERC20(tokenAddress).transfer(owner, tokenAmount);
    }

    receive() external payable {}

    fallback() external payable {}
}
