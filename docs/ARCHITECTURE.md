# Architecture

## A0 Governor
Evaluates evidence, enforces constraints, and determines whether a hypothesis failed.

## A1 Market
Collects external market evidence. It cannot fabricate demand and cannot recognize revenue.

## A2 Opportunity
Qualifies opportunities and performs limited, personalized outreach. It must identify itself as an AI agent when appropriate.

## A3 Treasury
Receives native-asset payments, records cumulative receipts, and allows only policy-compliant outbound transfers.

### Safety properties
- starts with zero economic capital;
- receive-first;
- configurable spending cap;
- allowlist for payout destinations;
- pausable;
- outbound transfers require an authorized executor;
- no embedded private keys.

## Consultants
Advisory only. Maximum one new specialized consultant per cycle, and only after a prior falsifiable hypothesis is judged failed.

## Event flow
1. A1 discovers evidence.
2. A2 qualifies an opportunity.
3. External counterparty pays A3.
4. A3 emits an on-chain receipt event.
5. A0 verifies the event and recognizes revenue.
6. If revenue > 0, expansionary outreach stops.
