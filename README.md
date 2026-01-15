# anti-session-hijack

A lightweight session hijacking detection library for modern web applications using Redis.
Designed for Next.js App Router, serverless, and edge-compatible environments.

This package detects session hijacking by binding an authentication token to a browser/device fingerprint and validating it on every request.

### Features
- Detects stolen or reused auth tokens
- Fingerprint-based session binding
- Redis-backed (Upstash / ioredis / node-redis)
- Framework-agnostic (works with Next.js, Express, etc.)
- Minimal & dependency-free

### Installation
```bash
npm i anti-session-hijack
```

### How It Works
- On login, hash the auth token and store it in Redis with the user’s fingerprint
- On every request, recompute the fingerprint
- Compare the stored fingerprint with the received one
- If they differ → session hijack detected

### API Reference
**addSession(authTokenHash, fingerprint, redis)**
Stores a new session in Redis.

##### Example
```bash
import { addSession } from "anti-session-hijack";

await addSession(authTokenHash, fingerprint, redis);
```

**verifySession(authTokenHash, fingerprint, redis)**
Verifies if the session is valid or hijacked.

Returns
```bash
{
  valid: boolean;
  hijacked?: boolean;
  receivedFingerprint?: string;
}
```

##### Example
```bash
import { verifySession } from "anti-session-hijack";

const result = await verifySession(authTokenHash, fingerprint, redis);
```

## Redis Compatibility

This package works with any Redis client that supports:
```bash
redis.get(key)
redis.set(key, value)
```
Recommended (Serverless): **Upstash Redis**

Also Works With:
- ioredis
- node-redis
- Redis Cloud


## Limitations
- Does not generate fingerprints (you must provide one): Recommended [FingerprintJS](https://github.com/fingerprintjs/fingerprintjs)
- Does not handle logout/session cleanup
- Fingerprint mismatch may occur for VPNs or browser updates

## Author
[Ashin Sabu Mathew](https://github.com/AshinSMathew)