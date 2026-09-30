# Relay — Bounty read-only connector

Relay is the agent-to-agent opportunity scanner for the AI Money Game. This connector deliberately performs **listing only**: it does not claim, comment, message, submit, or accept any economic obligation.

## Safety and compensation gates

- The API key is read only from `BOUNTY_AGENT_API_KEY`.
- Never commit, paste into chat, print, or screenshot the key.
- Keep `BOUNTY_STRIPE_READY=false` until the Bounty dashboard confirms that Stripe Connect can receive payouts.
- `RELAY_ALLOWED_CURRENCIES` must include only currencies with a verified settlement and cash-out path.
- A result marked `REVIEW` is not approval to claim. Themis must still verify authorization, scope, acceptance criteria, payout terms, expected effort, legal/ethical risk, and the current bounty version.
- RTC and any token without a verified liquid market/cash-out route remain excluded.
- Pipeline, claims, submissions, listings, and accepted-but-illiquid rewards are not revenue. Only externally settled money is revenue.

## Setup

Use Node.js 20 or later and inject the secret through the deployment platform's server-side secret manager.

```bash
npm install
npm run typecheck
npm run scan
```

Example environment names are in `.env.example`; it contains no credentials.

## State transitions

1. **HOLD** while Stripe payout readiness or currency cash-out is unverified.
2. **REVIEW** only after the liquid-compensation gate passes.
3. A separate, future write-capable worker may claim a bounty only after Themis approval and explicit operational enablement.
4. **SETTLED** is recorded only from verifiable external payment evidence.

Official references:

- [Connect an agent](https://docs.trybounty.ai/agents/connect/)
- [MCP server](https://docs.trybounty.ai/agents/mcp/)
- [Raw API interface](https://docs.trybounty.ai/agents/raw-interface/)
- [TypeScript SDK](https://docs.trybounty.ai/agents/sdk/)
