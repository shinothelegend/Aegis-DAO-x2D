# Aegis-DAO: Anonymous Governance & Confidential Funding

A privacy-preserving DAO management portal designed for **DoraHacks IITG.eth (Road to Devcon)**. Aegis-DAO solves two of the most critical privacy challenges in decentralized organizations: **anonymous identity-verified voting** (preventing political profiling and coercion) and **confidential treasury funding** (preventing correlation of treasury capital inflow).

---

## 🌟 Core Features

1. **Sybil-Resistant Anonymous Governance (Semaphore V4)**:
   - Users generate a secure ZK identity locally in their browser.
   - Users submit their identity commitment to join the DAO on-chain.
   - Users cast votes on active proposals anonymously.
   - Group Merkle tree verification prevents external observers from linking the voting address back to the registered wallet.
   - Double-voting is mathematically prevented per proposal using proposal-scoped nullifiers.

2. **Confidential Treasury Funding (Kohaku Privacy Pools)**:
   - Users can shield ERC20 tokens into the DAO treasury.
   - Integrates the **Kohaku SDK** to derive secure precommitments locally in the browser.
   - Calls the Privacy Pools standard to register commitment-based deposits, breaking the public transaction link between the donor's address and the DAO treasury assets.

3. **Premium Glassmorphic Dashboard**:
   - Modern, fully responsive, glassmorphic UI styled using Tailwind.
   - Smooth state transitions, browser-side ZK proof generation logs, and transaction status trackers.

---

## 🛠️ Technology Stack & Privacy Architecture

### 1. Anonymous Voting (Semaphore V4)
Semaphore is a zero-knowledge protocol designed for private proof of membership. Under Semaphore V4:
* **Local Identity**: An identity consists of a private key seed generated in the browser. It derives a public `Identity Commitment`.
* **On-Chain Group**: The DAO contract acts as a Semaphore Group manager. When members join, their commitment is inserted into an on-chain Lean Incremental Merkle Tree (LeanIMT).
* **Zero-Knowledge Vote**: To vote, the user generates a Groth16 proof demonstrating:
  1. Membership in the Group Merkle tree.
  2. Possession of the identity's private key.
  3. A unique nullifier generated for that specific proposal (scope).
  4. The vote signal (message).
* **On-Chain Verification**: The `AegisDAO` contract calls the Semaphore manager to validate the proof, verifying that the member is part of the group and hasn't voted on this proposal yet, without revealing who they are.

### 2. Confidential Treasury (Kohaku SDK)
Kohaku standardizes interaction with shielded pool protocols (like Privacy Pools):
* **Keystore Secret Manager**: We utilize Kohaku's `SecretManager` to derive deterministic secrets based on the user's path.
* **Precommitment Generation**: A cryptographically secure precommitment is generated from the derived `nullifier` and `salt` (`hash([nullifier, salt])`) using Poseidon hashing.
* **Shielding Deposit**: The frontend triggers a transaction to the `MockEntrypoint` contract passing the token address, amount, and the precommitment. This registers the deposit on-chain, preparing the funds for shielded transfers/withdrawals.

---

## 📂 Project Structure

```
aegis-dao/
├── contracts/          # Solidity Hardhat Workspace
│   ├── contracts/
│   │   ├── AegisDAO.sol          # Semaphore V4 Anonymous Governance
│   │   ├── MockEntrypoint.sol    # Kohaku Privacy Pools Mock Entrypoint
│   │   ├── MockERC20.sol         # Faucet Token (aeUSD) for shielding
│   │   └── SemaphoreWrappers.sol # Dependency compiler artifacts
│   ├── scripts/
│   │   └── deploy.ts             # Hardhat deployment script
│   ├── hardhat.config.ts
│   └── tsconfig.json
├── frontend/           # Next.js Frontend Workspace
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Next.js main layout with Wagmi Providers
│   │   │   ├── providers.tsx     # Wagmi & React Query configuration
│   │   │   └── page.tsx          # Aegis-DAO main dashboard page
│   │   ├── config.ts             # Deployed contract addresses & ABIs
│   │   └── kohaku-helper.ts      # Kohaku precommitment generator helper
│   ├── package.json
│   └── tsconfig.json
└── README.md           # This submission document
```

---

## 🚀 Local Setup & Installation

Follow these instructions to run the project locally on a Linux terminal.

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm** or **yarn**
- **Browser Wallet** (e.g. MetaMask configured to Localhost Network)

### Step 1: Start Local EVM Blockchain Node
1. Navigate to the `contracts/` directory:
   ```bash
   cd contracts
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Hardhat local node:
   ```bash
   npx hardhat node
   ```
   *Keep this terminal window open.*

### Step 2: Deploy Smart Contracts
1. Open a new terminal window/tab and navigate to `contracts/`:
   ```bash
   cd contracts
   ```
2. Run the deployment script:
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```
3. Upon success, you will see output like this:
   ```
   SEMAPHORE_VERIFIER_ADDRESS="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
   SEMAPHORE_ADDRESS="0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
   AEGIS_DAO_ADDRESS="0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
   MOCK_ERC20_ADDRESS="0x0165878A594ca255338adfa4d48449f69242Eb8F"
   MOCK_ENTRYPOINT_ADDRESS="0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
   ```

### Step 3: Run the Next.js Frontend
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Configure Your Wallet for Local Verification
1. Import one of the private keys printed in the Hardhat terminal (e.g., Account #0 or #1) into your browser wallet.
2. Add a custom network in MetaMask pointing to:
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
3. Connect your wallet to the portal, generate your ZK identity, and start testing!
