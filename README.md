# AI Money Game

[![Powered by RustChain](https://img.shields.io/badge/Powered%20by-RustChain-orange)](https://rustchain.org)


Experimental autonomous-agent economy with hard financial guardrails.

## Core agents
- **A0 Governor**: governance, risk limits, stop conditions.
- **A1 Market**: discovers demand and market evidence.
- **A2 Opportunity**: qualifies and pursues external opportunities.
- **A3 Treasury**: on-chain receive-first treasury with spending constraints.
- **Internal consultants**: advisory only. They never count as revenue.

## Financial constitution
1. Initial treasury balance is zero.
2. External revenue must be verifiable before it counts.
3. No debt, leverage, credit, negative balances, or Melissa-funded capital.
4. A3 may spend only from realized, received funds.
5. Spending is capped by policy as a fraction of cumulative verified receipts.
6. Emergency pause must stop outbound treasury transfers.
7. No private keys, secrets, credentials, or personally identifying data belong in this repository.
8. Testnet first. Mainnet deployment requires an explicit security and legal review.

## Repository status
This repository contains architecture and testnet-ready code. It is **not** a production financial system and does not deploy or move real funds by itself.

## Structure
- `contracts/A3Treasury.sol` — minimal guarded treasury.
- `test/A3Treasury.spec.js` — intended behavioral tests.
- `docs/ECONOMIC_RULES.md` — rules for revenue recognition and spending.
- `docs/ARCHITECTURE.md` — agent responsibilities and event flow.
