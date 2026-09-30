'use strict';

const { evaluateScope } = require('./scopeGate');
const { leaseProfile, releaseProfile } = require('./browserOpsPolicy');
const { createEvidenceRecord } = require('./evidenceLedger');

function startResearch({ target, authorization, testCategory, automation, profile, leaseId }) {
  const scopeDecision = evaluateScope({
    target,
    authorization,
    testCategory,
    automation
  });

  if (scopeDecision.decision !== 'ALLOW') {
    return { ok: false, stage: 'SCOPE', scopeDecision };
  }

  const lease = leaseProfile(profile, { leaseId, scopeDecision });
  if (!lease.ok) {
    return { ok: false, stage: 'LEASE', scopeDecision, lease };
  }

  return {
    ok: true,
    stage: 'RESEARCH_READY',
    scopeDecision,
    profile: lease.profile
  };
}

function finishResearch({ profile, leaseId, finding }) {
  if (!finding || finding.validated !== true) {
    return {
      ok: false,
      stage: 'VALIDATION',
      reason: 'finding_not_validated'
    };
  }

  const evidence = createEvidenceRecord({
    findingId: finding.id,
    targetHost: profile.targetHost,
    kind: finding.kind,
    description: finding.description,
    artifact: finding.artifact
  });

  const release = releaseProfile(profile, leaseId);
  if (!release.ok) {
    return { ok: false, stage: 'RELEASE', evidence, release };
  }

  return {
    ok: true,
    stage: 'DISCLOSURE_READY',
    evidence,
    profile: release.profile
  };
}

module.exports = { startResearch, finishResearch };
