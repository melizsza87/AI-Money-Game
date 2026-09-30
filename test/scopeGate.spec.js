const { expect } = require('chai');
const { evaluateScope } = require('../src/scopeGate');
const { leaseProfile } = require('../src/browserOpsPolicy');

describe('Security Scope Gate', function () {
  const auth = {
    verified: true,
    program: 'Example Bounty',
    allowedHosts: ['app.example.com', '*.lab.example.com'],
    deniedHosts: ['admin.lab.example.com'],
    allowedTestCategories: ['source_review', 'authz_validation'],
    automationAllowed: true
  };

  it('allows an in-scope authorized target', function () {
    const r = evaluateScope({
      target: 'https://app.example.com',
      authorization: auth,
      testCategory: 'authz_validation',
      automation: true
    });
    expect(r.decision).to.equal('ALLOW');
  });

  it('stops on unverified authorization', function () {
    const r = evaluateScope({
      target: 'app.example.com',
      authorization: { ...auth, verified: false },
      testCategory: 'source_review'
    });
    expect(r.decision).to.equal('STOP');
  });

  it('stops on explicitly denied host', function () {
    const r = evaluateScope({
      target: 'admin.lab.example.com',
      authorization: auth,
      testCategory: 'source_review'
    });
    expect(r.decision).to.equal('STOP');
  });

  it('hard-blocks destructive categories', function () {
    const r = evaluateScope({
      target: 'app.example.com',
      authorization: auth,
      testCategory: 'denial_of_service'
    });
    expect(r.decision).to.equal('STOP');
  });

  it('prevents sharing a leased profile', function () {
    const scopeDecision = evaluateScope({
      target: 'app.example.com',
      authorization: auth,
      testCategory: 'source_review'
    });
    const r = leaseProfile(
      { id: 'p1', activeLease: 'lease-a', targetHost: 'app.example.com' },
      { leaseId: 'lease-b', scopeDecision }
    );
    expect(r.ok).to.equal(false);
  });
});
