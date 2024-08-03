
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

    function getClaimsData() public view returns (address[] memory, uint256[] memory, uint256) {
        uint256 totalUsers = registeredTokenIds.length;
        address[] memory users = new address[](totalUsers);
        uint256[] memory claimCounts = new uint256[](totalUsers);
        uint256 totalValue = 0;

        uint256 uniqueUserCount = 0;
        address[] memory tempProcessed = new address[](totalUsers);

        for (uint256 i = 0; i < registeredTokenIds.length; i++) {
            NFT memory nft = registeredNFTs[registeredTokenIds[i]];
            address user = nft.owner;

            bool isProcessed = false;
            for (uint256 j = 0; j < uniqueUserCount; j++) {
                if (tempProcessed[j] == user) {
                    isProcessed = true;
                    break;
                }
            }

            if (!isProcessed) {
                tempProcessed[uniqueUserCount] = user;
                users[uniqueUserCount] = user;
                claimCounts[uniqueUserCount] = getClaimCountByUser(user);
                totalValue += claimCounts[uniqueUserCount] * REWARD_PER_CLAIM;
                uniqueUserCount++;
            }
        }

        assembly {
            mstore(users, uniqueUserCount)
            mstore(claimCounts, uniqueUserCount)
        }

        return (users, claimCounts, totalValue);
    }

    function getClaimCountByUser(address user) public view returns (uint256) {
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

        return claimCount;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function recoverERC20(address tokenAddress, uint256 tokenAmount) public onlyOwner {
        IERC20(tokenAddress).transfer(owner, tokenAmount);
    }

    function recoverFunds() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function setClaimingEnabled(bool enabled) public onlyOwner {
        claimingEnabled = enabled;
        emit ClaimingEnabled(enabled);
    }

    receive() external payable {}

    fallback() external payable {}
}
