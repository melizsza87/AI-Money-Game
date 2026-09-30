'use strict';

function normalizeAsset(asset = {}) {
  return {
    chain: String(asset.chain || '').toLowerCase(),
    symbol: String(asset.symbol || '').toUpperCase(),
    contract: asset.contract ? String(asset.contract).toLowerCase() : null,
    testnet: Boolean(asset.testnet),
    liquid: asset.liquid !== false
  };
}

function evaluateBlockchainReceipt({
  expected,
  receipt,
  policy
}) {
  if (!expected || !receipt || !policy) {
    return { state: null, reason: 'missing_fields' };
  }

  const asset = normalizeAsset(receipt.asset);

  if (asset.testnet) {
    return { state: null, reason: 'testnet_not_revenue' };
  }

  if (policy.chain && asset.chain !== String(policy.chain).toLowerCase()) {
    return { state: null, reason: 'wrong_chain' };
  }

  if (policy.symbol && asset.symbol !== String(policy.symbol).toUpperCase()) {
    return { state: null, reason: 'wrong_asset' };
  }

  if (policy.contract) {
    const got = asset.contract || '';
    if (got !== String(policy.contract).toLowerCase()) {
      return { state: null, reason: 'wrong_contract' };
    }
  }

  if (!receipt.txHash || receipt.verified !== true) {
    return { state: 'CLAIMED', reason: 'unverified_transfer' };
  }

  const minConf = Number(policy.minConfirmations || 1);
  const confirmations = Number(receipt.confirmations || 0);

  if (confirmations < minConf || receipt.final !== true) {
    return {
      state: 'ACCEPTED',
      reason: 'pending_finality',
      evidence: {
        txHash: receipt.txHash,
        confirmations,
        minConfirmations: minConf
      }
    };
  }

  const expectedAmount = Number(expected.amount);
  const gotAmount = Number(receipt.amount);
  const tolerance = Number(policy.amountTolerance || 0);

  if (!Number.isFinite(expectedAmount) || !Number.isFinite(gotAmount)) {
    return { state: null, reason: 'invalid_amount' };
  }

  if (Math.abs(gotAmount - expectedAmount) > tolerance) {
    return {
      state: null,
      reason: 'amount_mismatch',
      evidence: { expectedAmount, gotAmount, tolerance }
    };
  }

  return {
    state: 'SETTLED',
    evidence: {
      provider: 'blockchain',
      chain: asset.chain,
      symbol: asset.symbol,
      contract: asset.contract,
      txHash: receipt.txHash,
      amount: gotAmount,
      confirmations,
      liquid: asset.liquid
    }
  };
}

function canMarkWithdrawable({ settledRecord, custody }) {
  if (!settledRecord || settledRecord.state !== 'SETTLED') {
    return { ok: false, reason: 'not_settled' };
  }
  if (!custody || custody.humanControlled !== true) {
    return { ok: false, reason: 'custody_not_human_controlled' };
  }
  if (custody.agentHasPrivateKey === true) {
    return { ok: false, reason: 'agent_key_custody_forbidden' };
  }
  return { ok: true };
}

module.exports = {
  normalizeAsset,
  evaluateBlockchainReceipt,
  canMarkWithdrawable
};
