'use strict';

const crypto = require('crypto');

function hashPayload(payload) {
  const normalized = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function createEvidenceRecord({
  findingId,
  targetHost,
  kind,
  description,
  artifact,
  createdAt = new Date().toISOString()
}) {
  if (!findingId || !targetHost || !kind || !description) {
    throw new Error('missing_required_evidence_fields');
  }

  return Object.freeze({
    findingId,
    targetHost,
    kind,
    description,
    artifactHash: artifact == null ? null : hashPayload(artifact),
    createdAt
  });
}

module.exports = { hashPayload, createEvidenceRecord };
