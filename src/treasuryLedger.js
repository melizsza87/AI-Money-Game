'use strict';

const STATES = Object.freeze({
  CLAIMED: 'CLAIMED',
  ACCEPTED: 'ACCEPTED',
  SETTLED: 'SETTLED',
  WITHDRAWABLE: 'WITHDRAWABLE'
});

const ALLOWED = Object.freeze({
  CLAIMED: new Set(['ACCEPTED']),
  ACCEPTED: new Set(['SETTLED']),
  SETTLED: new Set(['WITHDRAWABLE']),
  WITHDRAWABLE: new Set()
});

function transition(entry, nextState, evidence = {}) {
  if (!entry || !STATES[nextState]) throw new Error('invalid_state');
  if (!ALLOWED[entry.state] || !ALLOWED[entry.state].has(nextState)) {
    throw new Error('invalid_transition');
  }
  return {
    ...entry,
    state: nextState,
    history: [
      ...(entry.history || []),
      {
        from: entry.state,
        to: nextState,
        at: new Date().toISOString(),
        evidence
      }
    ]
  };
}

function createClaim({ id, source, amount, currency }) {
  if (!id || !source || amount == null || !currency) {
    throw new Error('missing_claim_fields');
  }
  return {
    id,
    source,
    amount,
    currency: currency.toUpperCase(),
    state: STATES.CLAIMED,
    history: []
  };
}

module.exports = { STATES, createClaim, transition };
