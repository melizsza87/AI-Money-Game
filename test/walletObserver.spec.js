const { expect } = require('chai');
const {
  observeBitcoinTx,
  observeEvmNativeTx
} = require('../src/walletObserver');

describe('Wallet Observer', function () {
  const originalFetch = global.fetch;

  afterEach(function () {
    global.fetch = originalFetch;
  });

  it('observes BTC received by the configured address', async function () {
    global.fetch = async (url) => {
      if (url.endsWith('/blocks/tip/height')) {
        return { ok: true, text: async () => '103' };
      }
      return {
        ok: true,
        json: async () => ({
          txid: 'tx1',
          vout: [
            { scriptpubkey_address: 'bc1qreceiver', value: 100000 }
          ],
          status: { confirmed: true, block_height: 101 }
        })
      };
    };

    const r = await observeBitcoinTx({
      txid: 'tx1',
      receiveAddress: 'bc1qreceiver',
      minConfirmations: 3
    });

    expect(r.verified).to.equal(true);
    expect(r.confirmations).to.equal(3);
    expect(r.final).to.equal(true);
    expect(r.amount).to.equal(0.001);
  });

  it('rejects an EVM tx sent to another address', async function () {
    global.fetch = async (_url, options) => {
      const body = JSON.parse(options.body);
      const map = {
        eth_getTransactionByHash: {
          to: '0x1111111111111111111111111111111111111111',
          value: '0xde0b6b3a7640000'
        },
        eth_getTransactionReceipt: {
          status: '0x1',
          blockNumber: '0x64'
        },
        eth_blockNumber: '0x70'
      };
      return { ok: true, json: async () => ({ jsonrpc: '2.0', id: 1, result: map[body.method] }) };
    };

    const r = await observeEvmNativeTx({
      txHash: '0xabc',
      receiveAddress: '0x2222222222222222222222222222222222222222',
      rpcUrl: 'https://rpc.example'
    });

    expect(r.verified).to.equal(false);
    expect(r.amount).to.equal(1);
  });
});
