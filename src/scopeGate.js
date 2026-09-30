'use strict';

const HARD_BLOCKS = new Set([
  'credential_theft',
  'destructive_testing',
  'denial_of_service',
  'persistence',
  'lateral_movement',
  'data_exfiltration',
  'secret_exposure',
  'private_key_custody'
]);

function normalizeHost(value = '') {
  try {
    const url = value.includes('://') ? new URL(value) : new URL('https://' + value);
    return url.hostname.toLowerCase();
  } catch {
    return '';
  }
}

function hostMatches(pattern, host) {
  if (!pattern || !host) return false;
  pattern = pattern.toLowerCase().trim();
  host = host.toLowerCase().trim();
  if (pattern.startsWith('*.')) {
    const suffix = pattern.slice(1);
    return host.endsWith(suffix) && host !== suffix.slice(1);
  }
  return host === pattern;
}

function evaluateScope({ target, authorization, testCategory, automation = false }) {
  if (!authorization || authorization.verified !== true) {
    return { decision: 'STOP', reason: 'authorization_not_verified' };
  }

  if (HARD_BLOCKS.has(testCategory)) {
    return { decision: 'STOP', reason: 'hard_blocked_test_category' };
  }

  const host = normalizeHost(target);
  if (!host) return { decision: 'STOP', reason: 'invalid_target' };

  const allowed = (authorization.allowedHosts || []).some(p => hostMatches(p, host));
  const denied = (authorization.deniedHosts || []).some(p => hostMatches(p, host));

  if (!allowed || denied) {
    return { decision: 'STOP', reason: 'target_out_of_scope' };
  }

  if (automation && authorization.automationAllowed !== true) {
    return { decision: 'STOP', reason: 'automation_not_authorized' };
  }

  if (
    Array.isArray(authorization.allowedTestCategories) &&
    authorization.allowedTestCategories.length > 0 &&
    !authorization.allowedTestCategories.includes(testCategory)
  ) {
    return { decision: 'STOP', reason: 'test_category_not_authorized' };
  }

  return {
    decision: 'ALLOW',
    reason: 'verified_scope',
    host,
    program: authorization.program || null
  };
}

module.exports = { evaluateScope, normalizeHost, hostMatches };
