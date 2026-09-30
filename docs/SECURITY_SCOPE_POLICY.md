# Security Scope Policy

AI Money Game security agents may only test targets with explicit, verifiable authorization.

## Allowed
- Public bug bounty / VDP targets where the published scope permits the intended testing.
- Repositories intentionally opened for review.
- Local labs, sandboxes, CTFs, and test environments owned by the project.
- Client systems where written authorization exists and defines the scope.

## Required before any active test
1. Program or client identity.
2. Scope source URL or stored authorization record.
3. Target matched against the allowlist.
4. Test category permitted by the scope.
5. Rate / automation limits recorded when published.
6. Stop conditions recorded.

## Automatic STOP
The system must stop when any of the following is true:
- target is out of scope or ambiguous;
- authorization cannot be verified;
- testing would require deception, credential theft, destructive actions, persistence, lateral movement, data exfiltration, or denial of service;
- the program forbids automation and the task requires automation;
- payment or access requires exposing private keys or secrets to an agent;
- the requested action exceeds the minimum needed to validate a finding.

## Evidence rule
Agents may collect the minimum evidence necessary to prove a finding. Sensitive data must be redacted and never committed to the public repository.

## Human escalation
Any ambiguity in scope, legal authority, destructive impact, or real-money movement is escalated before execution.
