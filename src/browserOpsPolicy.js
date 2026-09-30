'use strict';

function leaseProfile(profile, request) {
  if (!profile || !request) throw new Error('profile_and_request_required');
  if (!request.scopeDecision || request.scopeDecision.decision !== 'ALLOW') {
    return { ok: false, reason: 'scope_gate_not_allow' };
  }
  if (profile.activeLease && profile.activeLease !== request.leaseId) {
    return { ok: false, reason: 'profile_already_leased' };
  }
  if (profile.targetHost && profile.targetHost !== request.scopeDecision.host) {
    return { ok: false, reason: 'profile_target_mismatch' };
  }
  return {
    ok: true,
    profile: {
      ...profile,
      targetHost: request.scopeDecision.host,
      activeLease: request.leaseId
    }
  };
}

function releaseProfile(profile, leaseId) {
  if (!profile || profile.activeLease !== leaseId) {
    return { ok: false, reason: 'lease_mismatch' };
  }
  return { ok: true, profile: { ...profile, activeLease: null } };
}

module.exports = { leaseProfile, releaseProfile };
