# Economic Rules

## Revenue recognition
Revenue counts only when all of the following are true:
- it originates from an external counterparty;
- receipt is independently verifiable;
- the amount and asset are known;
- the transaction is final enough for the configured network;
- it is not an internal transfer, test token, faucet credit, consultant action, fabricated event, or Melissa-funded deposit.

## Spending rule
Let:
- R = cumulative verified external receipts recorded by the treasury;
- S = cumulative outbound spend;
- bps = spend limit in basis points.

Then:
`S + newSpend <= R * bps / 10_000`

Default target policy: 5,000 bps = 50%.

## Prohibited
- debt
- borrowing
- leverage
- margin
- credit products
- KYC performed in Melissa's name without her explicit action
- custody of private keys by repository code
- negative-balance APIs
- synthetic/fabricated revenue

## Stop condition
When verified external revenue > 0:
- stop adding new consultants;
- stop expansionary outreach;
- notify Melissa with evidence;
- switch from acquisition expansion to fulfillment and governance.
