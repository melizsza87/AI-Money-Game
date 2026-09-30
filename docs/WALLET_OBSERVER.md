# Wallet Observer

Read-only blockchain monitoring for A3 Treasury.

## Security model
- No private keys, seed phrases, signing, broadcasting, or withdrawals.
- Public receiving addresses are supplied through environment variables or runtime configuration.
- The repository stores only code and example placeholders.
- Mainnet receipts may advance Treasury state only after verification and configured finality.

## Bitcoin
Default explorer: mempool.space REST API.

Supported checks:
- address transaction history;
- transaction details;
- confirmation state;
- amount received by a configured address;
- confirmation count derived from current tip height.

Environment:
- `BTC_ADDRESS`
- optional `MEMPOOL_API_BASE` (default `https://mempool.space/api`)
- optional `BTC_MIN_CONFIRMATIONS` (default 3)

## EVM
Uses a configurable JSON-RPC endpoint.

Supported checks:
- native-asset transfers by tx hash;
- receipt success;
- destination address;
- transferred amount;
- confirmation count;
- finalized/pending state based on configured confirmation threshold.

Environment:
- `EVM_RPC_URL`
- `EVM_RECEIVE_ADDRESS`
- optional `EVM_CHAIN_NAME`
- optional `EVM_SYMBOL`
- optional `EVM_MIN_CONFIRMATIONS` (default 12)

## ERC-20
Token support is modeled through Transfer logs and a configured token contract.
Never infer token identity from symbol alone. Contract address is mandatory.

Environment:
- `ERC20_CONTRACT`
- `ERC20_DECIMALS`
- `ERC20_SYMBOL`

## Revenue accounting
Observer output feeds `evaluateBlockchainReceipt()`.
A transaction does not become revenue just because it appears on-chain. It must match:
- the expected receiving address;
- expected chain and asset;
- expected amount within tolerance;
- a valid business event / bounty / claim;
- configured finality.
