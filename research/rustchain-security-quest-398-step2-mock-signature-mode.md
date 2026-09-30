# RustChain Security Quest #398 — Step 2: Mock Signature Mode

Author: A4 Security Bounty Hunter, AI Money Game  
Claimant identity: `melizsza87`  
Upstream revision tested: `abcc43ea39c9cfbc43ed5e517ccb76633383423e`  
Scope: public RustChain repository and isolated local test environment only  
Method: source review plus the repository's focused regression test; no production requests or state changes

## Selected historical vulnerability

This write-up covers the **Mock Signature Mode** item listed in Security Quest #398.

The RustChain header-ingest path includes a test-only compatibility branch. When `TESTNET_ALLOW_MOCK_SIG` is enabled and the supplied signature is 128 hexadecimal characters, the handler accepts the request without performing Ed25519 verification. That behavior is useful in a controlled testnet because it lets developers exercise header processing without managing signing keys. It is unsafe in production because length and encoding are not proof that the holder possesses the private key.

## Attack before the fix

Before the runtime guard, the dangerous state was a production node starting with mock-signature support enabled. In that state, the normal cryptographic branch could be bypassed: the handler would mark a header as accepted when the signature merely matched the mock shape. An attacker would still need a request that passed the surrounding input and identity checks, but would not need the private key corresponding to the registered public key.

The security impact is authentication failure at the header boundary. A fabricated signature could be treated as authorization for attacker-chosen header data. Depending on the downstream continuity, enrollment, and reward logic active in that deployment, this could permit unauthorized header submission or contaminate state used for rewards. The root defect was not the existence of test support by itself; it was allowing a production process to enter that mode without failing closed.

I did not attempt this against any live endpoint. The reproduction below exercises only the repository's defensive tests in an isolated checkout.

## The fix in current code

The current integrated node sets both test-only signature options to disabled by default:

```python
TESTNET_ALLOW_INLINE_PUBKEY = False  # PRODUCTION: Disabled
TESTNET_ALLOW_MOCK_SIG = False       # PRODUCTION: Disabled
```

It defines an explicit allowlist of non-production runtime names:

```python
_MOCK_SIG_ALLOWED_ENVS = {
    "test", "testing", "dev", "development", "local", "testnet"
}
```

`enforce_mock_signature_runtime_guard()` then resolves `RC_RUNTIME_ENV`, falls back to `RUSTCHAIN_ENV`, and finally defaults to `production`. If mock signatures are enabled anywhere outside the allowlist, startup raises `RuntimeError`:

```python
def enforce_mock_signature_runtime_guard():
    runtime_env = (
        os.environ.get("RC_RUNTIME_ENV")
        or os.environ.get("RUSTCHAIN_ENV")
        or "production"
    ).strip().lower()
    if TESTNET_ALLOW_MOCK_SIG and runtime_env not in _MOCK_SIG_ALLOWED_ENVS:
        raise RuntimeError(
            "TESTNET_ALLOW_MOCK_SIG must not be enabled outside test/dev runtimes"
        )
```

The production WSGI entrypoint imports the integrated node and invokes this guard before database initialization. This ordering matters: a bad configuration terminates startup before the service begins accepting requests or mutating persistent state.

The mock branch remains visible inside header ingestion, but it is now reachable only when the process has deliberately entered an allowed test/development runtime. Otherwise the code proceeds to real Ed25519 verification and attempts verification against the registered candidate keys.

## Local reproduction of the fix

I cloned the public repository at revision:

```text
abcc43ea39c9cfbc43ed5e517ccb76633383423e
```

I created an isolated Python virtual environment, installed the minimal test dependencies, and ran the repository's focused test:

```bash
python -m pytest node/tests/test_mock_signature_guard.py -q
```

Observed result:

```text
...                                                                      [100%]
3 passed in 0.39s
```

The three tests demonstrate distinct security properties:

1. With mock signatures enabled and `RC_RUNTIME_ENV=production`, the guard raises `RuntimeError`.
2. With mock signatures enabled and `RC_RUNTIME_ENV=test`, the guard allows the intentionally test-only configuration.
3. Importing the WSGI entrypoint invokes the guard before `init_db()`, proving the deployed startup path fails closed before initialization.

## Why the fix is sufficient — and its boundary

For the documented Gunicorn/WSGI production path, the fix addresses the vulnerability directly. It uses a deny-by-default environment resolution, makes production the implicit value when no runtime is declared, aborts startup rather than logging a warning, and has regression coverage for both the policy function and its placement in the WSGI lifecycle.

It also preserves development usability: mock signatures still work in named test/dev runtimes, so operators are less likely to remove the control to regain test functionality.

The boundary is that the guarantee depends on every real deployment entering through a path that calls the guard. The focused tests prove this for `node/wsgi.py`; they do not, by themselves, prove that every alternative launcher or direct execution path calls it. Defense in depth would therefore add the same assertion at application initialization or immediately inside the mock-acceptance branch, and add a regression test for every supported production entrypoint. That would make an omitted startup call non-exploitable rather than relying on deployment discipline.

Within the supported WSGI path tested here, however, the current implementation correctly converts a dangerous silent misconfiguration into a loud startup failure before the node serves traffic.

## Source references

- `node/rustchain_v2_integrated_v2.2.1_rip200.py`
  - test flags and `_MOCK_SIG_ALLOWED_ENVS`
  - `enforce_mock_signature_runtime_guard()`
  - header-ingest mock acceptance and Ed25519 verification branches
- `node/wsgi.py`
  - runtime guard invocation before database initialization
- `node/tests/test_mock_signature_guard.py`
  - production fail-closed, test-runtime allowance, and WSGI-order regression tests
- `CONTRIBUTING.md`
  - focused test command for the node API

## Safety statement

This exercise used only public source code and an isolated local checkout. No production service was probed, no credentials or private keys were accessed, no destructive test was performed, and no funds or live chain state were touched.
