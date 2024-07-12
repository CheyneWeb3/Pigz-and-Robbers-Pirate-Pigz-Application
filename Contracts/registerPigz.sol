// SPDX-License-Identifier: MIT
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

    mapping(address => mapping(uint256 => string)) public nftTraits; // Stores trait of each NFT by owner address and tokenId
    mapping(address => uint256[]) public ownerNFTs; // Stores all token IDs of each owner
    mapping(uint256 => NFT) public registeredNFTs; // Maps tokenId to NFT details
    uint256[] public registeredTokenIds; // Stores all registered token IDs

    uint256 public constant REWARD_PER_CLAIM = 6 * 1e18; // 6 MATIC
    uint256 public constant MAX_TOKEN_ID = 300; // Maximum token ID
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

        uint256[] memory tokens = ownerNFTs[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            string memory trait = nftTraits[user][tokens[i]];
            if (keccak256(bytes(trait)) == keccak256(bytes("Pirate Ship"))) {
                pirateShipCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Tavern"))) {
                tavernCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Island"))) {
                islandCount++;
            }
        }

        return pirateShipCount > 0 && tavernCount > 0 && islandCount > 0;
    }

    function enableClaiming(bool enabled) public onlyOwner {
        claimingEnabled = enabled;
        emit ClaimingEnabled(enabled);
    }

    function claimReward() public {
        require(claimingEnabled, "Claiming is not enabled");
        require(hasValidClaim(msg.sender), "No valid claim");

        uint256 claimCount = 0;
        uint256 pirateShipCount = 0;
        uint256 tavernCount = 0;
        uint256 islandCount = 0;

        uint256[] memory tokens = ownerNFTs[msg.sender];
        for (uint256 i = 0; i < tokens.length; i++) {
            string memory trait = nftTraits[msg.sender][tokens[i]];
            if (keccak256(bytes(trait)) == keccak256(bytes("Pirate Ship"))) {
                pirateShipCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Tavern"))) {
                tavernCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Island"))) {
                islandCount++;
            }

            if (pirateShipCount > 0 && tavernCount > 0 && islandCount > 0) {
                claimCount++;
                pirateShipCount--;
                tavernCount--;
                islandCount--;
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

        uint256[] memory tokens = ownerNFTs[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            string memory trait = nftTraits[user][tokens[i]];
            if (keccak256(bytes(trait)) == keccak256(bytes("Pirate Ship"))) {
                pirateShipCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Tavern"))) {
                tavernCount++;
            } else if (keccak256(bytes(trait)) == keccak256(bytes("Island"))) {
                islandCount++;
            }

            if (pirateShipCount > 0 && tavernCount > 0 && islandCount > 0) {
                claimCount++;
                pirateShipCount--;
                tavernCount--;
                islandCount--;
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
