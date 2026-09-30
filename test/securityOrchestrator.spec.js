const { expect } = require('chai');
const { startResearch, finishResearch } = require('../src/securityOrchestrator');
const { createClaim, transition } = require('../src/treasuryLedger');
const { stripePaymentToTreasuryState } = require('../src/stripeState');

describe('Security Orchestrator', function () {
  const authorization = {
    verified: true,
    program: 'Demo',
    allowedHosts: ['app.example.com'],
    deniedHosts: [],
    allowedTestCategories: ['source_review'],
    automationAllowed: true
  };

  it('requires scope before leasing a profile', function () {
    const r = startResearch({
      target: 'https://evil.example.org',
      authorization,
      testCategory: 'source_review',
      automation: true,
      profile: { id: 'p1' },
      leaseId: 'L1'
    });
    expect(r.ok).to.equal(false);
    expect(r.stage).to.equal('SCOPE');
  });

  it('moves a validated finding to disclosure-ready', function () {
    const started = startResearch({
      target: 'https://app.example.com',
      authorization,
      testCategory: 'source_review',
      automation: true,
      profile: { id: 'p1' },
      leaseId: 'L1'
    });
    const done = finishResearch({
      profile: started.profile,
      leaseId: 'L1',
      finding: {
        id: 'F1',
        kind: 'logic',
        description: 'demo finding',
        artifact: 'redacted evidence',
        validated: true
      }
    });
    expect(done.ok).to.equal(true);
    expect(done.stage).to.equal('DISCLOSURE_READY');
    expect(done.evidence.artifactHash).to.be.a('string');
  });
});

describe('Treasury', function () {
  it('does not skip economic states', function () {
    const c = createClaim({ id: 'X', source: 'bounty', amount: 10, currency: 'RTC' });
    expect(() => transition(c, 'SETTLED')).to.throw('invalid_transition');
  });

  it('maps succeeded Stripe payments to SETTLED', function () {
    const r = stripePaymentToTreasuryState({
      id: 'pi_test',
      status: 'succeeded',
      amount_received: 4900,
      currency: 'usd'
    });
    expect(r.state).to.equal('SETTLED');
    expect(r.evidence.amount).to.equal(4900);
  });
});
