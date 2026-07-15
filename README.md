# Pact — Make Promises Your Future Self Can't Break

**Pact** transforms discipline into programmable, on-chain commitments. By leveraging the speed and security of the **Monad Testnet**, Pact allows users to create immutable promises, lock up stakes, assign trusted guardians, and hold themselves accountable—forever.

![Pact Cover](/assets/pact-logo.jpg)

## 🌟 Core Features

- **Immutable Commitments:** Once you make a pact, the rules are enforced by an un-upgradable smart contract. You cannot back out.
- **Rule Engines:**
  - **Time Lock:** Funds unlock only after a specific date.
  - **Cooldown:** Request an unlock, then wait out a mandatory penalty period before accessing funds.
  - **Friend Approval (Guardians):** A nominated wallet address must approve the release of your funds.
- **Commitment Scoring:** Build an on-chain reputation. Breaking pacts burns your score; completing them builds it up.
- **Zero-API AI Assistant:** A fully self-contained, offline-first AI assistant lives on the platform. It answers questions instantly without any API keys, rate limits, or external dependencies.
- **Global Localization:** Dynamic, instant DOM translation supporting 8 languages (English, Spanish, Mandarin, Hindi, Arabic, French, Russian, Portuguese) to bring accountability to a global audience.

## 🛠️ Technology Stack

Pact is built with a modern, high-performance web3 stack:
- **Frontend Framework:** [Next.js 16](https://nextjs.org/) (App Router) + React 19
- **Styling & Animation:** [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **Web3 Connectivity:** [Reown AppKit](https://reown.com/) + [Wagmi](https://wagmi.sh/) + [Viem](https://viem.sh/)
- **Blockchain Network:** [Monad Testnet](https://monad.xyz/)
- **Smart Contracts:** Solidity + [Hardhat](https://hardhat.org/) + [OpenZeppelin](https://www.openzeppelin.com/)

## 🚀 Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/pact.git
cd pact
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory and configure the following variables:
```env
# Reown AppKit Project ID (Get yours at cloud.reown.com)
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id

# Monad Testnet Configuration
NEXT_PUBLIC_NETWORK_RPC=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_NETWORK_CHAIN_ID=10143
NEXT_PUBLIC_NATIVE_TOKEN_SYMBOL=MON

# Deployed Contract Address
NEXT_PUBLIC_PACT_ADDRESS=your_deployed_contract_address
```
> **Security Note:** Never commit your `DEPLOYER_PRIVATE_KEY` to public repositories. Ensure `.env.local` is in your `.gitignore`.

### 3. Run the Frontend
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## 📜 Smart Contract Development

The smart contracts are located in the `contracts/` directory.

**Compile Contracts:**
```bash
npx hardhat compile
```

**Run Tests:**
```bash
npm run test
```

**Deploy to Monad Testnet:**
1. Ensure `DEPLOYER_PRIVATE_KEY` and `MONAD_TESTNET_RPC` are set in `.env.local`.
2. Run the deployment script:
```bash
npx hardhat run scripts/deploy.ts --network monadTestnet
```

## 🌍 License
This project is open-source and available under the [MIT License](LICENSE).
