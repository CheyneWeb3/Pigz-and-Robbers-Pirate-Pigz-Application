
# 🧱 The Definitive Encyclopedic Guide to Deploying and Minting NFTs on TON

---

## 📌 Introduction

The Open Network (TON) is a high-performance, horizontally scalable Layer-1 blockchain originally developed by Telegram. Leveraging the TON Virtual Machine (TVM) and unique languages like FunC and Fift, TON offers capabilities that differ markedly from Ethereum-style EVM environments. NFTs on TON conform to the **TIP-4.1** (collection) and **TIP-4.2** (item) standards, where every NFT is deployed as its own smart contract (“item”), and a collection contract is used solely to mint and register items.

This guide is crafted as an **encyclopedic reference** for developers—from those new to blockchain to seasoned smart contract engineers—detailing every facet of building, deploying, and operating an NFT ecosystem on TON:

1. **Blockchain and Toolchain Overview**
2. **Project Scaffolding with `toncli`**
3. **Smart Contract Fundamentals (TIP-4.1 & TIP-4.2)**
4. **FunC Contract Development**
5. **Metadata Strategies and Storage**
6. **Compilation, ABI, and Deployment**
7. **Manual Deployment via Fift & Lite Client**
8. **Frontend Integration: React + TON Connect**
9. **Testing, Debugging, and Simulation**
10. **Security Best Practices**
11. **Performance and Gas Optimization**
12. **Scaling to Large Collections**
13. **Telegram Mini App and Social UX**
14. **Analytics, Monitoring, and Indexing**
15. **Mainnet Migration and Governance**
16. **Ecosystem Tools and References**

By the end of this document, you will possess a comprehensive understanding and ready-to-use reference for initiating an NFT project on TON—from concept through a live, user-facing minting dApp.

---

## 1. Blockchain and Toolchain Overview

### 1.1 TON Architecture

* **TVM (TON Virtual Machine):** A register-based VM optimized for parallel execution and infinite sharding.
* **Fift:** The low-level assembler language for writing bytecode directly against TVM.
* **FunC:** A C-like, high-level smart contract language that compiles into Fift/TVM.
* **Toncli:** A Python-based CLI tool for scaffolding projects, compiling, testing, and deploying contracts.

### 1.2 Key Differences from EVM

| Aspect            | Ethereum (EVM)            | TON (TVM)                                                |
| ----------------- | ------------------------- | -------------------------------------------------------- |
| VM                | Stack-based, gas metering | Register-based, gas metering                             |
| Contract Language | Solidity                  | FunC                                                     |
| NFT Model         | Single contract (ERC-721) | One contract per NFT (TIP-4.1 collection + TIP-4.2 item) |
| Tooling           | Hardhat / Foundry / Remix | toncli + FunC + Fift                                     |
| Sharding          | Layer-2 rolls             | Native infinite sharding                                 |
| Messaging Model   | External/internal calls   | Explicit message passing with slices                     |

---

## 2. Project Scaffolding with `toncli`

### 2.1 Installing `toncli`

```bash
pip install toncli --user
```

### 2.2 Bootstrapping a New Project

```bash
toncli start project my-ton-nft
cd my-ton-nft
```

This creates:

```
my-ton-nft/
├── contracts/           # FunC smart contract source files
│   ├── nft-collection.fc
│   └── nft-item.fc
├── tests/               # Unit and integration tests
├── build/               # Compiled artifacts (BOC, ABI)
├── ton-package.json     # Project metadata and dependencies
└── scripts/             # Deployment and utility scripts
```

### 2.3 Configuration Files

* **ton-package.json:** Defines compiler version, dependencies, network configs.
* **lite-client.config.json:** For manual Fift + lite-client interactions.

---

## 3. Smart Contract Fundamentals: TIP-4.1 & TIP-4.2

### 3.1 TIP-4.1: Collection Contract

* **Purpose:** Acts as a factory and registry; mints NFTs by deploying item contracts.
* **Core responsibilities:**

  * Store metadata template or base URI.
  * Authorize minters (owner-only or public).
  * Maintain a mapping (off-chain or on-chain via event logs) of minted tokens.

### 3.2 TIP-4.2: Item Contract

* **Purpose:** Represents a single NFT; stores ownership, metadata pointer, and transfer logic.
* **Core responsibilities:**

  * Accept transfer messages and change owner state.
  * Expose metadata via on-chain data or link to off-chain.
  * Implement query methods for owner and metadata.

---

## 4. FunC Contract Development

### 4.1 `nft-item.fc`

```func
#include "stdlib.fc"

// TIP-4.2: Single NFT logic
() recv_internal(slice in_msg) impure {
  var op = in_msg~load_uint(32);
  if (op == 0x5fcc3d14) {  // transfer operation
    var query_id = in_msg~load_uint(64);
    var new_owner = in_msg~load_msg_addr();
    // Persist new owner in storage
    set_data(begin_cell().store_slice(new_owner).end_cell());
    // Optionally emit an event by sending an internal message
  }
  // Additional operations: burn, approve (if needed)
}
```

* **Data Layout:** A single cell storing the owner’s address slice.
* **Upgrade Path:** If upgradeability needed, include code hash and dispenser logic.

### 4.2 `nft-collection.fc`

```func
#include "stdlib.fc"

// TIP-4.1: Collection contract
() recv_internal(slice in_msg) impure {
  var op = in_msg~load_uint(32);
  if (op == 0x249cbfa1) {  // mint operation
    var query_id = in_msg~load_uint(64);
    var owner = in_msg~load_msg_addr();
    var content = in_msg~load_ref();  // metadata cell

    // Build state_init for the item contract
    var code = get_code_for_nft_item(); // precompiled code cell
    var data = begin_cell()
      .store_slice(owner)
      .store_ref(content)
      .end_cell();
    var state_init = begin_cell()
      .store_ref(code)
      .store_ref(data)
      .end_cell();

    // Compute new address based on state_init hash
    var new_address = calc_address(state_init);

    // Deploy item contract with tokens
    send_raw_message(new_address, 100000000, state_init);

    // Optionally emit on-chain log by sending message back  
  }
}
```

* **`get_code_for_nft_item()`:** A helper to load the compiled item contract code.
* **Gas Budget:** Ensure sufficient value to cover creation and initial storage.

---

## 5. Metadata Strategies and Storage

### 5.1 On-Chain vs Off-Chain Metadata

| Approach          | Pros                                     | Cons                        |
| ----------------- | ---------------------------------------- | --------------------------- |
| On-Chain Storage  | Fully decentralized, immutable           | Gas-intensive, limited size |
| Off-Chain (IPFS)  | Scalable, supports large media           | Reliant on external service |
| Hybrid (On + Off) | Key fields on-chain, rich data off-chain | More complex implementation |

### 5.2 IPFS Pinning

* Use **Pinata** or **Web3.Storage** to pin JSON metadata and images.
* Store the **CID** in the NFT item’s data cell or off-chain mapping.

### 5.3 Metadata Schema Example

```json
{
  "name": "TON NFT #1",
  "description": "An exclusive TON collectible",
  "image": "ipfs://QmExampleHash",
  "external_url": "https://mytonnfts.example",
  "attributes": [
    { "trait_type": "Rarity", "value": "Legendary" },
    { "trait_type": "Background", "value": "Galaxy" }
  ]
}
```

---

## 6. Compilation, ABI, and Deployment

### 6.1 Compiling with `toncli`

```bash
toncli build
```

* Builds cell code for each `.fc` file into `.boc` (Bag of Cells) in `build/`.
* Generates JSON ABI files for each contract.

### 6.2 ABI Definition

Define each function signature, parameter types, and op codes:

```json
{
  "functions": [
    {
      "name": "mint",
      "id": "0x249cbfa1",
      "inputs": [
        { "name": "query_id", "type": "uint64" },
        { "name": "owner", "type": "address" },
        { "name": "content", "type": "cell" }
      ]
    }
  ]
}
```

### 6.3 Deploying to Testnet

1. **Fund your wallet** via the [Testnet Faucet](https://test.ton.org/).

2. **Deploy collection contract:**

   ```bash
   toncli deploy contracts/nft-collection.fc --wc 0 --value 1500000000
   ```

3. **Verify address** on [TonViewer Testnet](https://testnet.tonviewer.com/).

---

## 7. Manual Deployment via Fift & Lite Client

For edge-case or highly controlled deployment:

1. **Compile FunC to Fift:**

   ```bash
   func -SPA nft-collection.fc -o nft-collection.fif
   fift nft-collection.fif
   ```

2. **Send via Lite Client:**

   ```bash
   lite-client -C lite-client.config.json -c 'sendfile nft-collection.fif'
   ```

3. **Confirm via CLI logs** or JSON RPC queries.

---

## 8. Frontend Integration: React + TON Connect

### 8.1 Installing Dependencies

```bash
npm install @tonconnect/ui-react ton-core
```

### 8.2 Wallet Connection Component

```tsx
import { TonConnectButton } from "@tonconnect/ui-react";

export function ConnectWallet() {
  return <TonConnectButton />;
}
```

### 8.3 Mint Button Implementation

```tsx
import { useTonConnectUI } from "@tonconnect/ui-react";
import { beginCell, Address } from "ton-core";

export function MintButton({ collectionAddress }) {
  const { tonConnectUI, activeConnection } = useTonConnectUI();

  const mintNft = async () => {
    if (!activeConnection) return alert("Connect wallet first");

    const ownerAddress = activeConnection.account.address;
    const metadataCell = beginCell()
      .storeString("ipfs://QmExampleHash")
      .endCell();

    const body = beginCell()
      .storeUint(0x249cbfa1, 32)
      .storeUint(Date.now(), 64)
      .storeAddress(Address.parse(ownerAddress))
      .storeRef(metadataCell)
      .endCell();

    await tonConnectUI.sendTransaction({
      validUntil: Date.now() + 60000,
      messages: [
        {
          address: collectionAddress,
          amount: "1000000000",
          payload: body.toBoc().toString("base64"),
        },
      ],
    });
  };

  return <button onClick={mintNft}>Mint NFT</button>;
}
```

---

## 9. Testing, Debugging & Simulation

### 9.1 Unit Testing with `toncli`

* Place tests in `tests/`, using Fift scenario scripts or FunC test harness.

* Example test structure:

  ```
  tests/
  └── nft-item-test.fc
  ```

* Run:

  ```bash
  toncli test
  ```

### 9.2 Debugging Techniques

* Use **`toncli run`** to simulate internal messages.
* Inspect contract state with **TonAPI** or **JSON RPC** queries:

  ```bash
  curl -X POST https://testnet.toncenter.com/api/v2/getAccountState \
    -H "Content-Type: application/json" \
    -d '{"address":"<contract>","api_key":"<YOUR_KEY>"}'
  ```

---

## 10. Security Best Practices

1. **Query ID Randomization:** Prevent replay attacks by including unpredictable query IDs.
2. **Access Control:** Restrict mint and administrative functions to owner addresses.
3. **Gas Budget Checks:** Reject messages unlikely to complete execution due to insufficient funds.
4. **Input Validation:** Sanitize slice loads to avoid malformed data.
5. **Audit Contracts:** Perform internal code reviews and external audits.

---

## 11. Performance and Gas Optimization

* **Minimize On-Chain Data:** Store hashes/pointers instead of full metadata.
* **Shared Code Cells:** Deploy item code once, reference it in data cells.
* **Batch Operations:** Use off-chain scripts to submit multiple mint messages in parallel.

---

## 12. Scaling to Large Collections

* **Pre-Deploy Items:** Create all item contracts in a cold wallet, then assign owners later.
* **Indexer Integration:** Use **TonAPI** or **Graph-like** indexing to track and query ownership.
* **Dynamic Mint Passes:** Issue off-chain mint passes that users redeem on-chain.

---

## 13. Telegram Mini App and Social UX

* **Mini App Hosting:** Deploy your React dApp inside Telegram via a WebApp URL.
* **TON Connect QR:** Allow on-device wallet connections with QR or deep link.
* **Bot-Driven Minting:** Integrate a Telegram Bot to provide mint commands and status.

---

## 14. Analytics, Monitoring & Indexing

* **TonAPI:** Real-time queries for transactions, account states, and NFT lists.
* **Prometheus / Grafana:** Monitor node health, RPC latency, and gas usage.
* **Custom Dashboards:** Build analytics to track mint counts, transfer flows, and active holders.

---

## 15. Mainnet Migration and Governance

1. **Testnet Validation:** Fully test all paths—mint, transfer, query, fail cases.

2. **Mainnet Wallet Funding:** Acquire real TON, distribute to deployment keys.

3. **Deploy Collection Mainnet:**

   ```bash
   toncli deploy contracts/nft-collection.fc --network mainnet --value 2000000000
   ```

4. **Public Announcement:** Share contract address, marketplace listings, and dApp link.

5. **Governance Proposals:** If DAO-driven, submit proposals to manage contract parameters.

---

## 16. Ecosystem Tools & References

* **Documentation:** [https://docs.ton.org](https://docs.ton.org)
* **TIP Standard:** [https://github.com/ton-blockchain/TEPs/blob/master/text/0062-nft-standard.md](https://github.com/ton-blockchain/TEPs/blob/master/text/0062-nft-standard.md)
* **toncli GitHub:** [https://github.com/disintar/toncli](https://github.com/disintar/toncli)
* **TonAPI:** [https://tonapi.io](https://tonapi.io)
* **TonViewer:** [https://tonviewer.com](https://tonviewer.com)

---
