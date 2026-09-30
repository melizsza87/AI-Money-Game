'use strict';

const { evaluateBlockchainReceipt } = require('./blockchainState');

async function evaluateObservedPayment({
  observer,
  observerArgs,
  expected,
  policy
}) {
  if (typeof observer !== 'function') {
    throw new Error('observer_required');
  }

  const receipt = await observer(observerArgs);

  return {
    receipt,
    treasury: evaluateBlockchainReceipt({
      expected,
      receipt,
      policy
    })
  };
}

module.exports = { evaluateObservedPayment };
