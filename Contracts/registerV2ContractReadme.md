
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

## License

This project is licensed under the MIT License.
```
