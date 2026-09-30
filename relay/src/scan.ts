import Bounty from "@bounty-ai/agent-sdk";

type Decision = "REVIEW" | "HOLD" | "DROP";

type Candidate = {
  id: string | null;
  title: string | null;
  payout_cents: number;
  currency: string;
  decision: Decision;
  reason: string;
  version: number | string | null;
};

const apiKey = process.env.BOUNTY_AGENT_API_KEY;
if (!apiKey) {
  throw new Error(
    "Missing BOUNTY_AGENT_API_KEY. Inject it through a server-side secret store; never commit or print it.",
  );
}

const stripeReady = process.env.BOUNTY_STRIPE_READY === "true";
const allowedCurrencies = new Set(
  (process.env.RELAY_ALLOWED_CURRENCIES ?? "usd")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

const client = new Bounty({ apiKey });
const candidates: Candidate[] = [];

for await (const raw of client.bounties.iterate()) {
  const bounty = raw as Record<string, unknown>;
  const payoutCents = Number(bounty.payout_cents ?? 0);
  const currency = String(bounty.currency ?? "").trim().toLowerCase();

  let decision: Decision;
  let reason: string;

  if (!Number.isFinite(payoutCents) || payoutCents <= 0) {
    decision = "DROP";
    reason = "No positive liquid payout.";
  } else if (!currency || !allowedCurrencies.has(currency)) {
    decision = "HOLD";
    reason = "Currency cash-out path is not allowlisted as verified.";
  } else if (!stripeReady) {
    decision = "HOLD";
    reason = "Stripe Connect payout readiness is not yet confirmed.";
  } else {
    decision = "REVIEW";
    reason =
      "Liquid gate passed; still requires scope, acceptance, effort, risk, and version review before any claim.";
  }

  candidates.push({
    id: typeof bounty._id === "string" ? bounty._id : null,
    title: typeof bounty.title === "string" ? bounty.title : null,
    payout_cents: payoutCents,
    currency,
    decision,
    reason,
    version:
      typeof bounty.version === "number" || typeof bounty.version === "string"
        ? bounty.version
        : null,
  });
}

candidates.sort((a, b) => b.payout_cents - a.payout_cents);

console.log(
  JSON.stringify(
    {
      scanned_at: new Date().toISOString(),
      mode: "READ_ONLY_NO_CLAIMS",
      stripe_ready: stripeReady,
      allowed_currencies: [...allowedCurrencies],
      counts: {
        total: candidates.length,
        review: candidates.filter((item) => item.decision === "REVIEW").length,
        hold: candidates.filter((item) => item.decision === "HOLD").length,
        drop: candidates.filter((item) => item.decision === "DROP").length,
      },
      candidates,
    },
    null,
    2,
  ),
);
