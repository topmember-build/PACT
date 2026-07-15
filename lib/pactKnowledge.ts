// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface KnowledgeTopic {
 id: string;
 keywords: string[];
 answer: string;
 followUps: string[];
}

// ─── KNOWLEDGE BASE ───────────────────────────────────────────────────────────

export const KNOWLEDGE_BASE: KnowledgeTopic[] = [
 {
 id: 'what-is-pact',
 keywords: ['what', 'pact', 'is', 'explain', 'about', 'protocol', 'overview', 'works', 'purpose', 'why'],
 answer: `**Pact** is an onchain accountability protocol built on Monad.

It solves a simple but hard problem: human willpower fades. Pact lets you cryptographically lock funds behind specific, rule-based conditions enforced by an immutable smart contract.

**The key guarantee:** Once a Pact is sealed, *nobody* — not you, not the Pact team, not anyone — can access those funds until the exact conditions of your chosen rule are satisfied.

Think of it as a promise made to your future self, enforced by code instead of willpower.

**What you can do:**
- Lock MON or ERC-20 tokens behind any rule
- Assign trusted guardians for accountability
- Build a commitment score over time
- Earn achievements for discipline milestones`,
 followUps: ['How do I create a pact?', 'What rules can I choose?', 'Is it safe?'],
 },

 {
 id: 'getting-started',
 keywords: ['start', 'begin', 'beginner', 'first', 'new', 'how to', 'onboard', 'setup', 'get started', 'try'],
 answer: `Here's how to get started with Pact in 3 steps:

**Step 1 — Connect your wallet**
Click **"Connect Wallet"** in the top-right navbar. Pact supports MetaMask, WalletConnect (mobile QR), Coinbase Wallet, and more.

**Step 2 — Switch to Monad Testnet**
Make sure you're on **Monad Testnet (Chain ID 10143)**. If you see "Wrong Network" in the navbar, click it to switch automatically.

**Step 3 — Create your first pact**
Click **"Create Pact"** and follow the 6-step wizard:
1. Choose a token (MON or ERC-20)
2. Set your deposit amount
3. Pick a commitment rule
4. Write a message to your future self
5. Review everything
6. Seal it onchain 

> **Note:** Monad Testnet uses test funds — no real money is at risk while exploring.`,
 followUps: ['What rules can I pick?', 'How do I get MON testnet tokens?', 'What is Monad?'],
 },

 {
 id: 'create-pact',
 keywords: ['create', 'make', 'new pact', 'wizard', 'steps', 'how to create', 'build', 'set up pact', 'seal'],
 answer: `Creating a pact takes about 2 minutes through a **6-step wizard**:

**Step 1 — Choose Token**
Select MON (native) or a supported ERC-20 token to lock.

**Step 2 — Set Amount**
Enter how much you want to commit. You can always deposit more later.

**Step 3 — Pick a Rule**
Choose one rule to govern your pact:
- ⏰ Time Lock — locked until a date
- Cooldown — must wait after requesting release
- Friend Approval — a friend must approve
- Trusted Guardians — M-of-N multisig approval
- Savings Goal — locked until target amount reached

**Step 4 — Future Me**
Write a message to your future self. Optionally set a consequence if you break the pact.

**Step 5 — Review**
Double-check all your settings before sealing.

**Step 6 — Seal the Pact**
Sign and submit the transaction. Your pact is now live onchain!`,
 followUps: ['What is the Time Lock rule?', 'What is the Cooldown rule?', 'What are Trusted Guardians?'],
 },

 {
 id: 'timelock',
 keywords: ['time lock', 'timelock', 'date', 'unlock date', 'timestamp', 'until', 'when', 'expires', 'lock until'],
 answer: `**Time Lock** locks your funds until a specific date and time.

**How it works:**
- You pick an exact unlock date/time when creating the pact
- The smart contract stores this as a UNIX timestamp
- Calling \`release()\` *before* that time causes a contract revert — it's impossible to get funds out early
- After the date passes, you can release at any time

**Best for:**
- Building long-term savings discipline
- Committing to a goal with a deadline
- Preventing impulsive spending until a future date

**Example:** *"I won't touch this until January 1st"*

**Key fact:** Even Pact's developers cannot override a Time Lock. The rule is enforced entirely by the smart contract.`,
 followUps: ['What is the Cooldown rule?', 'How do I release funds?', 'What if I need funds early?'],
 },

 {
 id: 'cooldown',
 keywords: ['cooldown', 'cool down', 'waiting', 'timer', 'request', 'delay', 'countdown', 'period'],
 answer: `**Cooldown** requires you to formally request a release and then *wait* before funds are available.

**How it works:**
1. You call \`requestRelease()\` onchain — this starts the countdown
2. You must wait the full cooldown period (e.g. 7 days, 30 days)
3. Only after the timer expires can you call \`release()\`

**Best for:**
- Breaking impulsive decisions (the delay forces you to think)
- Commitments where you want a "cooling off" period
- Any goal where patience is part of the discipline

**Example:** *"I can only access this after a 30-day waiting period"*

**Key insight:** The cooldown starts fresh each time you request. If you cancel the request and try again, the clock resets.`,
 followUps: ['What is the Time Lock rule?', 'What are Trusted Guardians?', 'How do I release funds?'],
 },

 {
 id: 'friend-approval',
 keywords: ['friend', 'friend approval', 'one guardian', '1-of-1', 'single guardian', 'someone approve'],
 answer: `**Friend Approval** locks funds until at least **one trusted person** approves the release.

**How it works:**
- You assign 1–5 wallet addresses as guardians
- The threshold is set to 1 (any single guardian can approve)
- To release: a guardian calls \`approveRelease()\` onchain
- Once approved, you can call \`release()\`

**Key facts about guardians:**
- They can only *approve* — they cannot steal or move your funds
- They don't need MON to approve (just gas)
- You can update guardians before a release is requested
- Their wallet addresses are stored transparently onchain

**Best for:**
- Accountability partnerships
- Spouse/partner oversight
- A coach or mentor holding you accountable

**Example:** *"My friend must approve before I can touch this"*`,
 followUps: ['What are Trusted Guardians (M-of-N)?', 'How do guardians approve?', 'Can I change my guardians?'],
 },

 {
 id: 'trusted-guardians',
 keywords: ['trusted guardians', 'guardians', 'multisig', 'm-of-n', 'threshold', 'multiple', 'group', 'committee', 'quorum'],
 answer: `**Trusted Guardians** requires a *threshold* of guardians to approve before funds can be released.

**How it works:**
- You assign 1–5 guardian wallet addresses
- You set a threshold (e.g. 3-of-5 must approve)
- Each guardian independently calls \`approveRelease()\` onchain
- Once the threshold is reached, you can call \`release()\`

**Best for:**
- High-stakes commitments requiring group consensus
- DAO-style accountability
- Situations where you want multiple checks before accessing funds

**Example:** *"3 out of 5 of my accountability partners must agree before I can withdraw"*

**Guardian rules:**
- Guardians cannot move or steal funds
- Approvals are permanent once given
- You can see who approved onchain
- Guardians can be updated (before a release is in progress)`,
 followUps: ['How do guardians approve a release?', 'What is Friend Approval?', 'How do I assign guardians?'],
 },

 {
 id: 'savings-goal',
 keywords: ['savings', 'goal', 'target', 'save up', 'accumulate', 'reach amount', 'savings goal', 'hit target', 'top up'],
 answer: `**Savings Goal** locks funds until you've accumulated a target amount.

**How it works:**
- You set a target amount when creating the pact (e.g. 100 MON)
- You can deposit into the pact gradually over time
- Funds are locked until the total deposited reaches the target
- Once the goal is hit, funds can be released

**Best for:**
- Saving up for a specific purchase or milestone
- Building an emergency fund
- Any goal with a specific dollar/token amount attached

**Example:** *"I'm saving up 500 MON — I can't touch it until I reach my goal"*

**Key feature:** You can keep topping up the pact incrementally. Each deposit brings you closer to the unlock threshold.`,
 followUps: ['How do I deposit more funds?', 'How do I create a pact?', 'What is the Time Lock rule?'],
 },

 {
 id: 'which-rule',
 keywords: ['which rule', 'best rule', 'choose rule', 'pick rule', 'what rule', 'recommend', 'should i use', 'difference', 'compare rules'],
 answer: `Here's a quick guide to picking the right rule:

| Goal | Best Rule |
|------|-----------|
| Lock until a specific date | ⏰ **Time Lock** |
| Force a "cooling off" period | **Cooldown** |
| One accountability partner | **Friend Approval** |
| Group accountability (3-of-5, etc.) | **Trusted Guardians** |
| Save up to a target amount | **Savings Goal** |

**Quick tips:**
- Want the strictest lock? → **Time Lock** (no early exit)
- Want flexibility with friction? → **Cooldown**
- Trust someone else to decide? → **Guardians**
- Saving toward a number? → **Savings Goal**

All rules are equally secure — the choice is about what *kind* of accountability fits your goal best.`,
 followUps: ['Tell me about Time Lock', 'Tell me about Trusted Guardians', 'How do I create a pact?'],
 },

 {
 id: 'deposit',
 keywords: ['deposit', 'add funds', 'top up', 'contribute', 'fund', 'add more', 'send tokens', 'add money'],
 answer: `You can deposit funds into a pact in two ways:

**During creation:**
The initial deposit happens as part of the 6-step wizard when you seal the pact.

**After creation (top up):**
On any active pact card in your Dashboard, click **"Deposit"** to add more funds.
- For MON (native token): sent directly with \`deposit()\`
- For ERC-20 tokens: requires an approval step first, then \`depositERC20()\`

**Things to know:**
- You can deposit as many times as you want into an active pact
- Deposits are especially useful for the **Savings Goal** rule (topping up toward your target)
- Funds can only come from the pact owner's wallet`,
 followUps: ['How do I release funds?', 'What is the Savings Goal rule?', 'What tokens are supported?'],
 },

 {
 id: 'release',
 keywords: ['release', 'withdraw', 'get back', 'claim', 'unlock', 'access funds', 'take out', 'retrieve'],
 answer: `How you release funds depends on your pact's rule:

**Time Lock:**
After the unlock date passes → click **"Release"** on the pact card.

**Cooldown:**
1. Click **"Request Release"** to start the timer
2. Wait the full cooldown period
3. Return and click **"Release"**

**Friend Approval / Trusted Guardians:**
1. Click **"Request Release"**
2. Your guardian(s) go to the pact and call **"Approve Release"**
3. Once the threshold is met → click **"Release"**

**Savings Goal:**
Once your deposits reach the target amount → click **"Release"**.

**After release:**
Funds go directly back to your wallet. The pact status changes to **Fulfilled** .`,
 followUps: ['How do guardians approve?', 'What is the Cooldown rule?', 'What does "Fulfilled" mean?'],
 },

 {
 id: 'guardians-workflow',
 keywords: ['guardian approve', 'how guardian', 'guardian workflow', 'approve release', 'guardian steps', 'guardian process'],
 answer: `Here's the full guardian approval workflow:

**For the pact owner:**
1. Go to your pact (Dashboard → click pact card)
2. Click **"Request Release"**
3. Share the pact link or your pact ID with your guardian(s)
4. Wait for them to approve onchain

**For each guardian:**
1. Open the pact link / go to the pact page
2. They'll see an **"Approve Release"** button (only visible to assigned guardians)
3. They click it and sign the transaction — costs only a tiny gas fee
4. Their approval is recorded permanently onchain

**For the owner (after approval):**
1. Once the threshold is reached, the **"Release"** button becomes active
2. Click it to receive your funds

**Key points:**
- Guardians cannot steal funds — they can only vote to approve
- You can check who has approved on the pact detail page
- Approval is irreversible once given`,
 followUps: ['How do I assign guardians?', 'Can I change guardians?', 'What is the threshold?'],
 },

 {
 id: 'cancel',
 keywords: ['cancel', 'delete', 'remove pact', 'stop pact', 'end pact', 'close pact', 'cancel pact'],
 answer: `You can cancel a pact under certain conditions:

**When you can cancel:**
- The pact is **Active** and no release has been requested yet
- Go to the pact detail page → click **"Cancel Pact"**

**What happens:**
- Funds are returned to your wallet
- Pact status changes to **Canceled**
- The pact is permanently closed

**When you cannot cancel:**
- Once a release has been requested (for Cooldown/Guardian rules)
- After the pact is already Fulfilled or Broken

**Important:** Canceling is different from breaking. Canceling before any release request is a clean exit — it doesn't affect your commitment score the way a broken pact does.`,
 followUps: ['What is a broken pact?', 'What is the commitment score?', 'How do I release funds?'],
 },

 {
 id: 'commitment-score',
 keywords: ['commitment score', 'score', 'rating', 'points', 'reputation', 'track record', 'metric', 'calculate'],
 answer: `Your **Commitment Score** (0–1000) measures your track record of keeping promises.

**How it's calculated (onchain):**
- **Fulfilled pacts** → boost your score significantly
- **Broken pacts** → reduce your score
- **Completion rate** — % of pacts successfully fulfilled
- **Longest streak** — consecutive successful completions
- **Active pacts** — currently running commitments

**Where to see it:**
- **Dashboard** → top stats bar
- **Profile** page → full breakdown + achievements

**Score tiers:**
| Score | Meaning |
|-------|---------|
| 0–200 | Getting started |
| 200–500 | Building discipline |
| 500–800 | Strong track record |
| 800–1000 | Elite commitment |

The score is calculated entirely onchain via \`calculateCommitmentScore()\`.`,
 followUps: ['What achievements can I earn?', 'How does the Profile page work?', 'What is a fulfilled pact?'],
 },

 {
 id: 'achievements',
 keywords: ['achievement', 'badge', 'earn', 'milestone', 'trophy', 'unlock', 'reward', 'recognition'],
 answer: `Pact has **7 achievements** you can earn based on your commitment history:

| Achievement | Requirement |
|-------------|-------------|
| **First Pact** | Create your very first pact |
| **Iron Will** | Complete 3 pacts without breaking |
| **Diamond Hands** | Complete 10 pacts total |
| ️ **Guardian Protected** | Use trusted guardians on a pact |
| **100-Day Commitment** | Create a pact lasting at least 100 days |
| **Completion Master** | 100% completion rate with 5+ pacts |
| **Seven Day Discipline** | Maintain a 7-pact completion streak |

**Where to see them:**
Go to your **Profile** page → Achievements section.

Earned achievements show in full color; in-progress ones show a progress bar.`,
 followUps: ['What is the commitment score?', 'How do I view my profile?', 'How do I create a pact?'],
 },

 {
 id: 'dashboard',
 keywords: ['dashboard', 'my pacts', 'view pacts', 'pact list', 'manage pacts', 'overview', 'home'],
 answer: `The **Dashboard** is your command center for all pacts.

**What you'll find:**
- **Commitment Stats** — your score, completion rate, total locked, active pacts
- **Search** — find pacts by name or token
- ️ **Filter by status** — All | Active | Fulfilled | Broken | Canceled
- **Pact Cards** — click any card to view full details and take actions

**From the Dashboard you can:**
- View all your pacts at a glance
- Click a pact to deposit, request release, or view details
- Create a new pact via the **"+ Create Pact"** button

**Access:** Connect your wallet → click **Dashboard** in the navbar.`,
 followUps: ['How do I create a pact?', 'What do pact statuses mean?', 'How do I release funds?'],
 },

 {
 id: 'pact-status',
 keywords: ['status', 'active', 'fulfilled', 'broken', 'canceled', 'cancelled', 'what does', 'meaning', 'states'],
 answer: `Every pact has one of four statuses:

**🟢 Active**
The pact is live and funds are locked. You're in the commitment period.

** Fulfilled**
You successfully met the release conditions and claimed your funds. This is the best outcome and boosts your commitment score.

** Broken**
You attempted to release funds before conditions were met, or the contract determined the commitment was not honored. Reduces your commitment score.

** Canceled**
You canceled the pact before any release was attempted. Funds were returned. Neutral impact on score.

**In-between state:**
For Cooldown and Guardian rules, there's a "Release Requested" phase while you wait for the timer or guardian approvals.`,
 followUps: ['How do I release funds?', 'What is the commitment score?', 'How do I cancel a pact?'],
 },

 {
 id: 'wallet',
 keywords: ['wallet', 'connect', 'metamask', 'walletconnect', 'coinbase', 'rainbow', 'mobile wallet', 'qr code', 'sign in', 'login'],
 answer: `Pact supports multiple wallets through **Reown AppKit**:

**Supported wallets:**
- MetaMask (browser extension)
- Any WalletConnect mobile wallet (QR code)
- Coinbase Wallet
- Rainbow
- Rabby
- Any EIP-6963 injected wallet

**How to connect:**
1. Click **"Connect Wallet"** in the top-right navbar
2. Choose your wallet from the modal
3. Approve the connection in your wallet
4. Switch to **Monad Testnet** if prompted

**Mobile users:**
Choose the WalletConnect option → scan the QR code with any compatible mobile wallet app.

**Disconnecting:**
Click your wallet address in the navbar → **"Disconnect"**`,
 followUps: ['What is Monad Testnet?', 'How do I switch networks?', 'How do I get started?'],
 },

 {
 id: 'monad',
 keywords: ['monad', 'mon', 'chain', 'network', 'testnet', 'chain id', 'blockchain', 'evm', 'performance', 'speed'],
 answer: `Pact is built natively on **Monad**, a high-performance EVM-compatible blockchain.

**Why Monad?**
- **10,000 TPS** — handles massive transaction volume
- **400ms block time** — near-instant confirmations
- **~800ms finality** — transactions are final almost immediately
- **Very low fees** — affordable for frequent interactions
- **EVM-compatible** — works with all Ethereum tools and wallets

**Monad Testnet:**
- **Chain ID:** 10143
- **Native Token:** MON (test tokens, not real money)
- **RPC:** testnet-rpc.monad.xyz
- **Explorer:** testnet.monadexplorer.com

**Adding Monad Testnet:**
Click "Connect Wallet" → connect → if wrong network appears, click it and Pact will auto-add Monad Testnet to your wallet.`,
 followUps: ['How do I connect my wallet?', 'Where do I get testnet MON?', 'Is Pact safe to use?'],
 },

 {
 id: 'security',
 keywords: ['safe', 'secure', 'security', 'hack', 'custodial', 'reentrancy', 'audit', 'trust', 'risk', 'openzeppelin'],
 answer: `Pact's smart contract is built with security-first principles:

**Non-custodial:**
The protocol has zero administrative backdoors. Only the pact owner can ever receive their funds back — not Pact devs, not guardians.

**Reentrancy Protection:**
All state-modifying functions are protected by OpenZeppelin's \`ReentrancyGuard\`.

**Checks-Effects-Interactions:**
Internal state (marking pact fulfilled, zeroing balance) is updated *before* any external token transfers occur — preventing reentrancy attack vectors.

**Safe ERC20:**
We use OpenZeppelin's \`SafeERC20\` to handle edge cases with non-standard token implementations.

**Contract address (Monad Testnet):**
\`0x7D5A1368Dd5c3F04eC012fD67B4D22576d0b0D13\`

> **Note:** Pact is currently on testnet. Always exercise caution with any onchain protocol and only use testnet funds for now.`,
 followUps: ['What is Monad?', 'Can guardians steal my funds?', 'What is Pact?'],
 },

 {
 id: 'tokens',
 keywords: ['token', 'erc20', 'mon', 'native token', 'which tokens', 'supported tokens', 'currency', 'asset', 'coin'],
 answer: `Pact supports locking both native and ERC-20 tokens:

**MON (Native Token):**
- Monad's native token, used like ETH on Ethereum
- Sent directly with \`deposit()\` (no approval step needed)
- Selected by default in the pact wizard

**ERC-20 Tokens:**
- Standard Ethereum-compatible tokens deployed on Monad
- Require an \`approve()\` transaction before depositing
- Use \`depositERC20()\` to lock them in the pact

**How to choose:**
In the Create Pact wizard (Step 1), you'll see a token selector with all supported options. MON is the easiest to get started with on testnet.

> More tokens will be added as Monad's ecosystem grows.`,
 followUps: ['How do I deposit funds?', 'How do I get testnet MON?', 'How do I create a pact?'],
 },

 {
 id: 'profile',
 keywords: ['profile', 'stats', 'history', 'my stats', 'account', 'track record', 'profile page'],
 answer: `Your **Profile page** shows your full commitment history and reputation.

**What's on the Profile page:**

 **Commitment Score** (0–1000)
Your overall discipline rating, calculated onchain.

 **Stats Breakdown:**
- Completion rate (%)
- Total pacts created (lifetime)
- Active pacts
- Fulfilled & broken counts
- Longest winning streak
- Total MON locked across all pacts

 **Achievements**
All 7 achievements with progress bars for in-progress ones.

**Access:**
Connect wallet → click **Profile** in the navbar (or your wallet dropdown → Profile).`,
 followUps: ['What is the commitment score?', 'What achievements can I earn?', 'How do I improve my score?'],
 },

 {
 id: 'settings',
 keywords: ['settings', 'preferences', 'configure', 'options', 'customize', 'warning', 'banner'],
 answer: `The **Settings page** lets you configure display preferences:

**Available settings:**
- 🟡 **Testnet Warning Banner** — toggle the yellow "You are on testnet" banner at the top of the screen on/off

**Access:**
Connect wallet → navbar dropdown (click your address) → **Settings**

More settings will be added as Pact grows.`,
 followUps: ['What is Monad Testnet?', 'How do I connect my wallet?', 'What is Pact?'],
 },
];

// ─── FALLBACK ─────────────────────────────────────────────────────────────────

export const FALLBACK_ANSWER = `I can help you with these Pact topics — just ask:

- **Getting started** — how to connect and create your first pact
- **Rule types** — Time Lock, Cooldown, Friend Approval, Guardians, Savings Goal
- **Creating a pact** — step-by-step wizard walkthrough
- **Releasing funds** — how to unlock and withdraw
- **Guardians** — how to assign and how they approve
- **Commitment score** — how it's calculated
- **Achievements** — what badges you can earn
- **Dashboard & Profile** — navigating the app
- **Wallet connection** — supported wallets
- **Monad network** — the blockchain Pact runs on
- **Security** — how the smart contract protects funds

Try asking something like *"How do I create a pact?"* or *"What is the Cooldown rule?"*`;

export const SUGGESTED_PROMPTS = [
 'How do I create a pact?',
 'What rule type should I pick?',
 'How do guardians work?',
 'What is a commitment score?',
];
