# Agent Roles — Autonomous Security Unit

## A0 Governor
Owns policy, scope, kill-switches, conflict resolution, and the stop condition.

## A2 Opportunity
Finds authorized programs and commercial opportunities. Produces structured opportunity records, never performs intrusive testing.

## A3 Treasury
Tracks economic state only: CLAIMED -> ACCEPTED -> SETTLED -> WITHDRAWABLE. It does not hold banking credentials or private keys.

## A4 Security Bounty Hunter
Performs source review and authorized testing only after the Scope Gate returns ALLOW.

## A5 Validator / Duplicate Killer
Attempts to disprove A4's finding, checks reproducibility, impact, scope fit, and duplicate risk before disclosure.

## Browser Ops
Maintains isolated persistent browser profiles per authorized target. A profile belongs to one target and one research lease at a time.

Browser Ops may preserve:
- cookies and authenticated sessions created lawfully for that target;
- consent state;
- normal browser storage;
- screenshots and console evidence;
- sanitized request metadata.

Browser Ops must not:
- impersonate unrelated humans;
- bypass account or geographic restrictions that the program has not authorized;
- defeat CAPTCHA/anti-bot controls when doing so is prohibited;
- reuse credentials across unrelated targets;
- share one live profile across simultaneous agents.

## Disclosure
Only validated findings move to disclosure. Reports must identify AI involvement where appropriate and must not exaggerate severity or impact.
