# Blockchain Treasury

A3 Treasury supports blockchain receipts as a settlement rail without custody.

## Principles
- Agents never receive, store, generate, reveal, or commit private keys or seed phrases.
- Wallet custody is external to the agent system.
- Agents may observe public addresses, transaction hashes, confirmations, token contracts, and chain state.
- Public-chain observation does not itself make funds withdrawable.
- Testnet tokens, internal points, faucets, and non-liquid assets do not count as real revenue.

## Economic states
- CLAIMED: work submitted or payment requested.
- ACCEPTED: counterparty confirms the obligation or a pending transfer exists.
- SETTLED: an independently verifiable on-chain transfer is final enough for the configured chain policy.
- WITHDRAWABLE: the asset is under safe custody and can be converted or transferred under the human-controlled treasury policy.

## Chain policy
Each supported asset must define:
- chain identifier;
- asset identifier;
- receiving public address;
- minimum confirmations / finality rule;
- expected amount and tolerance;
- accepted token contract when applicable;
- liquidity / convertibility policy.

## Revenue rule
An on-chain receipt counts as external revenue only when:
1. sender is external to the experiment;
2. transfer is independently verifiable;
3. asset is not a test token or internal game token;
4. settlement finality has been reached;
5. the payment is attributable to a valid claim, bounty, invoice, or sale.

Assets with no independently verifiable liquidity may be tracked separately as non-cash economic value.
