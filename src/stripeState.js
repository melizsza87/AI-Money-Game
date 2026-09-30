'use strict';

function stripePaymentToTreasuryState(paymentIntent) {
  if (!paymentIntent || typeof paymentIntent !== 'object') {
    return { state: null, reason: 'invalid_payment_intent' };
  }

  switch (paymentIntent.status) {
    case 'succeeded':
      return {
        state: 'SETTLED',
        evidence: {
          provider: 'stripe',
          object: paymentIntent.id,
          amount: paymentIntent.amount_received ?? paymentIntent.amount,
          currency: paymentIntent.currency
        }
      };
    case 'processing':
    case 'requires_capture':
      return {
        state: 'ACCEPTED',
        evidence: { provider: 'stripe', object: paymentIntent.id }
      };
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
      return {
        state: 'CLAIMED',
        evidence: { provider: 'stripe', object: paymentIntent.id }
      };
    case 'canceled':
      return {
        state: null,
        reason: 'payment_canceled',
        evidence: { provider: 'stripe', object: paymentIntent.id }
      };
    default:
      return {
        state: null,
        reason: 'unmapped_status',
        evidence: { provider: 'stripe', object: paymentIntent.id, status: paymentIntent.status }
      };
  }
}

module.exports = { stripePaymentToTreasuryState };
