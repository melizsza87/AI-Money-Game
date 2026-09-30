const HARD_REJECTS = [
  'melissa_spend',
  'debt',
  'kyc',
  'identity_exposure',
  'private_key_custody',
  'deceptive_engagement',
  'destructive_security_testing',
  'material_obligation'
];

function scoreBounty(b) {
  const rejects = HARD_REJECTS.filter(k => b[k] === true);
  if (rejects.length) {
    return { eligible: false, lane: 'D', score: -Infinity, rejects };
  }

  const pos =
      3*(b.reward ?? 0)
    + 3*(b.acceptanceProbability ?? 0)
    + 2*(b.speed ?? 0)
    + 3*(b.autonomy ?? 0)
    + 2*(b.competition ?? 0)
    + 3*(b.verification ?? 0)
    + 1*(b.reusability ?? 0);

  const neg =
      3*(b.paymentFriction ?? 0)
    + 2*(b.externalAccountFriction ?? 0)
    + 2*(b.forkPermissionFriction ?? 0)
    + 2*(b.ambiguousScope ?? 0)
    + 5*(b.legalSecurityRisk ?? 0);

  let lane = 'A';
  if ((b.forkPermissionFriction ?? 0) >= 3) lane = 'B';
  if ((b.paymentFriction ?? 0) >= 4) lane = 'C';

  return { eligible: true, lane, score: pos - neg, rejects: [] };
}

function rankBounties(items) {
  return items
    .map(item => ({ ...item, evaluation: scoreBounty(item) }))
    .filter(x => x.evaluation.eligible)
    .sort((a,b) => b.evaluation.score - a.evaluation.score);
}

module.exports = { scoreBounty, rankBounties };
