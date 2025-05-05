# 📘 Compendium: Multi-Chain NFT Reward Distribution System

## 🧭 Project Summary

This document serves as a comprehensive technical and strategic guide for implementing a **multi-chain NFT reward distribution platform**, supporting both **EVM-based chains** and **TON (The Open Network)**. It outlines architecture, limitations, tools, frontends, backend logic, and future roadmap, compiled from system planning and stakeholder requirements.

---

## 🎯 Objectives

1. **Distribute monthly rewards to holders of 3 NFT collections on different chains:** Incentivize long-term holding and community engagement by providing consistent token-based or credit-based rewards.
2. **Implement chain-specific smart contracts with Merkle-based claim verification:** Ensure cost-efficient and secure distribution of rewards by deploying optimized contracts on each supported chain.
3. **Provide a flexible admin backend for reward uploads and mint bonuses:** Allow project teams to upload reward data, configure bonus structures, and manage snapshots without modifying contract logic.
4. **Offer both a Web3 dApp and a Telegram Mini App interface:** Maximize user accessibility and usability across desktop and mobile users through two complementary platforms.
5. **Support both EVM chains and the TON blockchain for NFT reward logic and UI:** Enable cross-ecosystem compatibility to include NFT holders from major EVM chains and the Telegram ecosystem.
6. **Enable viral growth and user acquisition via Telegram:** Leverage Telegram Mini App and share features to drive organic user growth and community participation.
7. **Implement snapshot-based reward logic with scalable architecture:** Use monthly snapshots of NFT ownership to calculate rewards in a way that scales with the number of users and NFTs.
8. **Handle cross-chain ownership and claim eligibility reliably:** Maintain accuracy and fairness in identifying eligible wallets across different blockchains.

---

## 🔧 Implementation Details

### Smart Contracts

* **EVM Contracts:**

  * Solidity-based, deployed per chain
  * Includes Merkle root storage for eligible claimants
  * Validates claims with `claim(bytes32[] memory proof, uint256 amount)`
  * Admin controls for uploading rewards, mint bonus toggles, and emergency stops

* **TON Contracts:**

  * Written in FunC or Tact
  * Simpler architecture with static reward verification or backend-assisted authorization
  * Supports integration with TIP-4.1 / TIP-4.2 NFT collection/item structures

### Backend Infrastructure

* **Node.js + Express** application
* **PostgreSQL** for:

  * Storing NFT snapshots (timestamped)
  * Reward distribution metadata
  * Claim verification status
* **Merkle tree generation** logic via `merkletreejs`
* **Scheduled jobs** for periodic snapshot & reward processing

### Snapshot System

* **EVM-based NFTs:**

  * Uses Alchemy, Moralis, or direct JSON-RPC via ethers.js
  * Aggregates token ownership by wallet

* **TON NFTs:**

  * Queries TonAPI or TonCenter
  * Parses and maps ownership using TIP-4.2-compatible methods

### Claim Handling

* **EVM Chains:**

  * On-chain claim using Merkle proof
  * Claim function checks against Merkle root and prevents duplicate claims

* **TON:**

  * Wallet connection via TON Connect
  * Backend handles reward eligibility check
  * Option to submit signed transaction from backend wallet or redirect to on-chain handler

---

## 💻 Web dApp Interface

* Multi-chain wallet support (MetaMask, WalletConnect)
* Dynamic dashboard showing:

  * NFTs owned per collection
  * Available reward amounts
  * Claim button with gas estimate preview
* Admin panel (secured):

  * Reward uploads
  * Bonus configuration
  * Manual snapshot triggering

## 📱 Telegram Mini App Interface

* Built using Telegram WebApp SDK
* Seamless TON Connect integration for wallet auth
* Rewards screen:

  * Shows NFTs and claim status for TON
  * One-click claim
  * Telegram push notification support
* Optional referral bonus flow via unique share links

---

## 💸 Bonus Logic Types

* **Mint Bonus:** Rewards based on mint order, e.g., first 100 minters
* **Rarity Bonus:** Extra rewards for holders of rare NFTs
* **Referral Bonus:** Users receive rewards for successful referrals tracked by links
* **Collection-wide Campaigns:** Airdrops or bonus drops to all holders at specific intervals

---

## ⚖️ EVM vs TON Summary

| Feature         | EVM Chains               | TON (Telegram)        |
| --------------- | ------------------------ | --------------------- |
| Language        | Solidity                 | FunC / Tact           |
| NFT Standard    | ERC-721 / ERC-1155       | TIP-4.1 / TIP-4.2     |
| Tooling         | Mature                   | Limited but improving |
| Merkle Proofs   | Supported (OpenZeppelin) | Manual impl required  |
| Wallets         | MetaMask, WalletConnect  | Tonkeeper, Tonhub     |
| Telegram Access | Indirect                 | Native Mini App       |

---

## 📊 Roadmap

### Phase 1: Foundation

* ✅ EVM contract deployment
* ✅ Web dApp MVP with wallet integration
* ✅ Snapshot + Merkle backend live

### Phase 2: TON + Telegram Expansion

* 🚧 Telegram Mini App live
* 🚧 TON NFT snapshot syncing
* 🚧 Push notifications + referral system

### Phase 3: Scaling & Insights

* 📈 Cross-project analytics dashboard
* 📈 On-chain/off-chain reward history export
* 📈 Multilingual UI, responsive layout

---

## 📦 Deliverables

* EVM smart contracts with Merkle reward & admin logic
* Optional TON claim contract
* PostgreSQL database + snapshot backend
* React-based multi-chain Web dApp
* Telegram Mini App with TON Connect
* Merkle tree generator with reward integration
* Admin panel + access controls

---

## 📚 Resources

* [TON Developer Docs](https://ton.org/docs)
* [TEP-62 NFT Standard](https://github.com/ton-blockchain/TEPs/blob/master/text/0062-nft-standard.md)
* [Telegram WebApp SDK](https://core.telegram.org/bots/webapps)
* [TonAPI](https://tonapi.io)
* [OpenZeppelin MerkleProof](https://docs.openzeppelin.com/contracts/4.x/api/utils#MerkleProof)
* [Wagmi / viem Docs](https://wagmi.sh/docs)

---
