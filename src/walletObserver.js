'use strict';

function hexToBigInt(value) {
  if (value == null) return null;
  return BigInt(value);
}

function normalizeHexAddress(value = '') {
  return String(value).toLowerCase();
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`http_${res.status}`);
  return res.json();
}

async function getBitcoinTipHeight(baseUrl = 'https://mempool.space/api') {
  const res = await fetch(`${baseUrl}/blocks/tip/height`);
  if (!res.ok) throw new Error(`http_${res.status}`);
  return Number(await res.text());
}

async function observeBitcoinTx({
  txid,
  receiveAddress,
  baseUrl = 'https://mempool.space/api',
  minConfirmations = 3
}) {
  if (!txid || !receiveAddress) throw new Error('btc_txid_and_address_required');

  const tx = await fetchJson(`${baseUrl}/tx/${encodeURIComponent(txid)}`);
  const tipHeight = await getBitcoinTipHeight(baseUrl);

  const receivedSats = (tx.vout || [])
    .filter(v => v && v.scriptpubkey_address === receiveAddress)
    .reduce((sum, v) => sum + Number(v.value || 0), 0);

  const confirmed = Boolean(tx.status && tx.status.confirmed);
  const blockHeight = confirmed ? Number(tx.status.block_height) : null;
  const confirmations = confirmed && Number.isFinite(blockHeight)
    ? Math.max(0, tipHeight - blockHeight + 1)
    : 0;

  return {
    asset: {
      chain: 'bitcoin',
      symbol: 'BTC',
      testnet: false,
      liquid: true
    },
    txHash: tx.txid,
    verified: receivedSats > 0,
    confirmations,
    final: confirmations >= Number(minConfirmations),
    amount: receivedSats / 100000000,
    receiveAddress
  };
}

async function rpcCall(rpcUrl, method, params = []) {
  if (!rpcUrl) throw new Error('rpc_url_required');
  const payload = { jsonrpc: '2.0', id: 1, method, params };
  const out = await fetchJson(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (out.error) throw new Error(`rpc_error:${out.error.code || 'unknown'}`);
  return out.result;
}

async function observeEvmNativeTx({
  txHash,
  receiveAddress,
  rpcUrl,
  chain = 'ethereum',
  symbol = 'ETH',
  minConfirmations = 12
}) {
  if (!txHash || !receiveAddress || !rpcUrl) {
    throw new Error('evm_txhash_address_rpc_required');
  }

  const [tx, receipt, latestHex] = await Promise.all([
    rpcCall(rpcUrl, 'eth_getTransactionByHash', [txHash]),
    rpcCall(rpcUrl, 'eth_getTransactionReceipt', [txHash]),
    rpcCall(rpcUrl, 'eth_blockNumber', [])
  ]);

  if (!tx) {
    return {
      asset: { chain, symbol, testnet: false, liquid: true },
      txHash,
      verified: false,
      confirmations: 0,
      final: false,
      amount: 0,
      receiveAddress
    };
  }

  const destinationMatches =
    normalizeHexAddress(tx.to) === normalizeHexAddress(receiveAddress);

  const success = receipt && receipt.status === '0x1';
  const blockNumber = receipt && receipt.blockNumber
    ? Number(hexToBigInt(receipt.blockNumber))
    : null;
  const latest = latestHex ? Number(hexToBigInt(latestHex)) : null;

  const confirmations = success && blockNumber != null && latest != null
    ? Math.max(0, latest - blockNumber + 1)
    : 0;

  const amountWei = hexToBigInt(tx.value || '0x0') || 0n;
  const amountEth = Number(amountWei) / 1e18;

  return {
    asset: { chain, symbol, testnet: false, liquid: true },
    txHash,
    verified: Boolean(destinationMatches && success),
    confirmations,
    final: Boolean(destinationMatches && success && confirmations >= Number(minConfirmations)),
    amount: amountEth,
    receiveAddress
  };
}

function topicAddress(address) {
  const clean = normalizeHexAddress(address).replace(/^0x/, '');
  if (clean.length !== 40) throw new Error('invalid_evm_address');
  return '0x' + clean.padStart(64, '0');
}

async function observeErc20Transfer({
  txHash,
  receiveAddress,
  tokenContract,
  decimals,
  symbol,
  rpcUrl,
  chain = 'ethereum',
  minConfirmations = 12
}) {
  if (!tokenContract || decimals == null || !symbol) {
    throw new Error('erc20_token_config_required');
  }

  const [receipt, latestHex] = await Promise.all([
    rpcCall(rpcUrl, 'eth_getTransactionReceipt', [txHash]),
    rpcCall(rpcUrl, 'eth_blockNumber', [])
  ]);

  if (!receipt || receipt.status !== '0x1') {
    return {
      asset: {
        chain,
        symbol,
        contract: normalizeHexAddress(tokenContract),
        testnet: false,
        liquid: true
      },
      txHash,
      verified: false,
      confirmations: 0,
      final: false,
      amount: 0,
      receiveAddress
    };
  }

  const transferSig =
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
  const destinationTopic = topicAddress(receiveAddress);
  let rawAmount = 0n;

  for (const log of receipt.logs || []) {
    if (
      normalizeHexAddress(log.address) === normalizeHexAddress(tokenContract) &&
      Array.isArray(log.topics) &&
      normalizeHexAddress(log.topics[0]) === transferSig &&
      normalizeHexAddress(log.topics[2]) === normalizeHexAddress(destinationTopic)
    ) {
      rawAmount += hexToBigInt(log.data || '0x0') || 0n;
    }
  }

  const blockNumber = Number(hexToBigInt(receipt.blockNumber));
  const latest = Number(hexToBigInt(latestHex));
  const confirmations = Math.max(0, latest - blockNumber + 1);
  const divisor = 10 ** Number(decimals);
  const amount = Number(rawAmount) / divisor;

  return {
    asset: {
      chain,
      symbol,
      contract: normalizeHexAddress(tokenContract),
      testnet: false,
      liquid: true
    },
    txHash,
    verified: rawAmount > 0n,
    confirmations,
    final: rawAmount > 0n && confirmations >= Number(minConfirmations),
    amount,
    receiveAddress
  };
}

module.exports = {
  getBitcoinTipHeight,
  observeBitcoinTx,
  rpcCall,
  observeEvmNativeTx,
  observeErc20Transfer
};
