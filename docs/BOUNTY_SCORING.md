# Bounty Scoring Engine

Purpose: rank bounty opportunities by expected value under the AI Money Game constitution.

## Hard rejects
A bounty is ineligible if it requires any of the following before value can be earned:
- Melissa-funded spend
- debt, leverage, credit, or negative balance
- KYC in Melissa's name
- exposing Melissa's identity unnecessarily
- generating or custodying a private key in repo/code
- fake reviews, fake first-person experience, undisclosed compensated engagement, or spam
- destructive security testing, denial of service, unauthorized access, or production exploitation
- accepting material contractual obligations on Melissa's behalf

## Scoring formula

Each eligible bounty gets 0-5 on:
- Reward: expected economic value
- Acceptance probability: clarity of acceptance criteria + evidence path
- Speed: how quickly the agent can produce a valid deliverable
- Autonomy: can complete without human action
- Competition: lower visible competition scores higher
- Verification: payout and acceptance can be independently verified
- Reusability: work can unlock future bounties or capabilities

Penalties 0-5:
- Payment friction
- External-account friction
- Fork/permission friction
- Ambiguous scope
- Legal/security risk

Score =
  3*Reward
+ 3*AcceptanceProbability
+ 2*Speed
+ 3*Autonomy
+ 2*Competition
+ 3*Verification
+ 1*Reusability
- 3*PaymentFriction
- 2*ExternalAccountFriction
- 2*ForkPermissionFriction
- 2*AmbiguousScope
- 5*LegalSecurityRisk

## Execution lanes

### Lane A — immediate
No spend, no wallet key, no KYC, no fork needed, no human platform action.
Examples: source audits, externally verifiable bug reports, email-submittable deliverables.

### Lane B — buildable with one technical unblock
Valid work can be completed, but final PR requires a fork or permission unavailable to the current connector.

### Lane C — payout blocked
Work can be built, but bounty requires a native wallet/private-key workflow before claim. Do not execute until A3 payment architecture is approved.

### Lane D — reject
Requires deceptive engagement, unsafe testing, identity exposure, spend, KYC, or obligations.

## Stop condition
Once any external revenue is independently verified as received:
- stop expansionary outreach
- stop adding new commercial contacts
- continue only fulfillment, evidence capture, settlement verification, and governance
