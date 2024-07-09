// SPDX-License-Identifier: MIT

/*
MAINNET ADDRESSES HERE
0x3b0eABb3b5b9323613159BA8F0519Df16C1AEf49

BSC Mainnet 0xCa695FEB6b1b603ca9fec66aaA98bE164db4E660 nfts
BSC Mainnet 0x88CE0d545cF2eE28d622535724B4A06E59a766F0 token
BSC Mainnet 18 Decimals
*/

pragma solidity 0.8.19;

import "@openzeppelin/contracts@4.5.0/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts@4.5.0/access/Ownable.sol";
import "@openzeppelin/contracts@4.5.0/access/AccessControl.sol";
import "@openzeppelin/contracts@4.5.0/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts@4.5.0/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts@4.5.0/token/ERC20/utils/SafeERC20.sol";

interface IPancakeRouter {
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
}

contract Alpha7RewardsDistributor is Ownable, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    address[] public operators;
    uint256 public constant MAX_OPERATORS = 3;
    uint8 public rewardTokenDecimals;

    IERC721Enumerable public nft;
    uint256 public totalAllocatedRewards;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public claimedRewards;

    IPancakeRouter public pancakeRouter;
    address public swapToken;
    address public constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;

    event RewardWithdrawn(address indexed holder, uint256 amount);
    event NativeTokenRecovered(uint256 amount);
    event RewardDirectlySent(address indexed recipient, uint256 amount);
    event OperatorAdded(address indexed operator);
    event OperatorRemoved(address indexed operator);
    event SwapTokenUpdated(address indexed oldToken, address indexed newToken);

    constructor(
        address _nft,
        uint8 _rewardTokenDecimals,
        address _pancakeRouter,
        address _swapToken
    ) {
        nft = IERC721Enumerable(_nft);
        rewardTokenDecimals = _rewardTokenDecimals;
        pancakeRouter = IPancakeRouter(_pancakeRouter);
        swapToken = _swapToken;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(OPERATOR_ROLE, msg.sender);
        operators.push(msg.sender);
    }

    modifier onlyOwnerOrOperator() {
        require(
            owner() == msg.sender || hasRole(OPERATOR_ROLE, msg.sender),
            "Caller is not the owner or operator"
        );
        _;
    }

    function addOperator(address operator) external onlyOwner {
        require(
            operators.length < MAX_OPERATORS,
            "Maximum number of operators reached"
        );
        require(operator != address(0), "Invalid operator address");
        _setupRole(OPERATOR_ROLE, operator);
        operators.push(operator);
        emit OperatorAdded(operator);
    }

    function removeOperator(address operator) external onlyOwner {
        require(hasRole(OPERATOR_ROLE, operator), "Address is not an operator");
        revokeRole(OPERATOR_ROLE, operator);

        for (uint256 i = 0; i < operators.length; i++) {
            if (operators[i] == operator) {
                operators[i] = operators[operators.length - 1];
                operators.pop();
                emit OperatorRemoved(operator);
                break;
            }
        }
    }

    function claimRewards() external nonReentrant {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards to withdraw");

        rewards[msg.sender] = 0;
        claimedRewards[msg.sender] += reward;
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Transfer failed");
        emit RewardWithdrawn(msg.sender, reward);
    }

    function claimRewardsAndSwap() external nonReentrant {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards to withdraw");

        rewards[msg.sender] = 0;
        claimedRewards[msg.sender] += reward;

        address[] memory path = new address[](2);
        path[0] = WBNB;
        path[1] = swapToken;

        pancakeRouter.swapExactETHForTokensSupportingFeeOnTransferTokens{
            value: reward
        }(
            0, // accept any amount of Tokens
            path,
            msg.sender,
            block.timestamp
        );

        emit RewardWithdrawn(msg.sender, reward);
    }

    function setSwapToken(address newToken) external onlyOwnerOrOperator {
        require(newToken != address(0), "Invalid token address");
        address oldToken = swapToken;
        swapToken = newToken;
        emit SwapTokenUpdated(oldToken, newToken);
    }

    function hasRewardsToClaim(address addr) external view returns (bool) {
        return rewards[addr] > 0;
    }

    function batchRewardAddresses(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwnerOrOperator {
        require(
            recipients.length == amounts.length,
            "Recipients and amounts length mismatch"
        );
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        require(
            address(this).balance >= totalAmount,
            "Insufficient rewards in the contract"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            rewards[recipients[i]] += amounts[i];
            totalAllocatedRewards += amounts[i];
            emit RewardDirectlySent(recipients[i], amounts[i]);
        }
    }

    function rewardAddressDirectly(
        address recipient,
        uint256 amount
    ) external onlyOwnerOrOperator {
        require(amount > 0, "Reward amount must be greater than zero");
        require(address(this).balance >= amount, "Insufficient rewards in the contract");

        rewards[recipient] += amount;
        totalAllocatedRewards += amount;
        emit RewardDirectlySent(recipient, amount);
    }

    function getRewardTokenBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getTotalAllocatedRewards() external view returns (uint256) {
        return totalAllocatedRewards;
    }

    function getClaimedRewards(address addr) external view returns (uint256) {
        return claimedRewards[addr];
    }

    function getTotalUnallocatedTokens() external view returns (uint256) {
        uint256 balance = address(this).balance;
        uint256 unallocated = balance - totalAllocatedRewards;
        return unallocated;
    }

    function recoverNativeToken(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
        emit NativeTokenRecovered(amount);
    }

    receive() external payable {}

    fallback() external payable {}
}
