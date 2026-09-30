# Browser Ops MVP

Purpose: provide persistent, isolated browser state for authorized security research without turning anti-bot evasion into an objective.

## State model
Each profile is bound to:
- one target host;
- one active lease at a time;
- one authorization record;
- one evidence directory;
- one lifecycle state: STOPPED, READY, LEASED, QUARANTINED.

## Lifecycle
1. Opportunity enters the queue.
2. Scope Gate evaluates authorization.
3. If ALLOW, Browser Ops leases an existing target-bound profile or provisions a fresh profile.
4. A4 performs only permitted actions.
5. Evidence is written to an append-only manifest.
6. A5 validates reproducibility and scope fit.
7. Profile is released or quarantined.
8. Only validated findings reach disclosure.

## Persistence
Profiles may retain lawful target-specific cookies, session state and browser storage. They must never be shared across unrelated targets.

## Evidence
Store hashes and metadata, not secrets. Raw evidence containing credentials, tokens, private data or customer content must remain outside the public repository.

## No anti-bot arms race
CAPTCHA, MFA, geo restrictions and anti-automation controls are not bypass objectives. If a program does not expressly permit the required automation, STOP.
