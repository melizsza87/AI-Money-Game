const { expect } = require('chai');
const {
  evaluateBlockchainReceipt,
  canMarkWithdrawable
} = require('../src/blockchainState');

describe('Blockchain Treasury', function () {
  const policy = {
    chain: 'bitcoin',
    symbol: 'BTC',
    minConfirmations: 3,
    amountTolerance: 0
  };

  it('does not count testnet as revenue', function () {
    const r = evaluateBlockchainReceipt({
      expected: { amount: 0.001 },
      receipt: {
        asset: { chain: 'bitcoin', symbol: 'BTC', testnet: true },
        txHash: 'abc',
        verified: true,
        confirmations: 6,
        final: true,
        amount: 0.001
      },
      policy
    });
    expect(r.state).to.equal(null);
    expect(r.reason).to.equal('testnet_not_revenue');
  });

  it('marks a pending real transfer as ACCEPTED', function () {
    const r = evaluateBlockchainReceipt({
      expected: { amount: 0.001 },
      receipt: {
        asset: { chain: 'bitcoin', symbol: 'BTC' },
        txHash: 'abc',
        verified: true,
        confirmations: 1,
        final: false,
        amount: 0.001
      },
      policy
    });
    expect(r.state).to.equal('ACCEPTED');
  });

  it('marks a final verified transfer as SETTLED', function () {
    const r = evaluateBlockchainReceipt({
      expected: { amount: 0.001 },
      receipt: {
        asset: { chain: 'bitcoin', symbol: 'BTC' },
        txHash: 'abc',
        verified: true,
        confirmations: 3,
        final: true,
        amount: 0.001
      },
      policy
    });
    expect(r.state).to.equal('SETTLED');
  });

  it('forbids agent private-key custody', function () {
    const r = canMarkWithdrawable({
      settledRecord: { state: 'SETTLED' },
      custody: {
        humanControlled: true,
        agentHasPrivateKey: true
      }
    });
    expect(r.ok).to.equal(false);
  });
});
