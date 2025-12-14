# Anti Session Hijack

A lightweight client-side SDK to prevent **session hijacking** by binding user sessions to a **browser fingerprint**.

This package works with a centralized authentication backend and ensures that a stolen session token **cannot be reused from a different browser or device**.

---

## Features

- Prevents session replay and hijacking
- Binds session tokens to browser fingerprint
- Automatic fingerprint generation
- Secure HttpOnly cookie-based authentication
- Simple SDK functions for easy integration
- Works with Next.js App Router backend

---

## Installation

```bash
npm i anti-session-hijack
```

## Usage
#### Import the SDK
```bash
import { signup, login, verifySession } from "anti-session-hijack";
```

#### 1️⃣ Sign Up
```bash
await signup("John Doe", "john@example.com", "password123");
```

#### 2️⃣ Login
```bash
await login("john@example.com", "password123");
```

On successful login, the authentication token is stored securely in an HttpOnly cookie.

#### 3️⃣ Verify Session (Protect Routes)
```bash
const result = await verifySession();

if (!result.valid) {
  // Redirect user to login
}
```

This function verifies:
- Session token validity
- Browser fingerprint consistency

## How It Works

- User logs in
- Browser fingerprint is generated
- Session token is issued by the server
- Token hash + fingerprint hash are stored in the database
- On every request, fingerprint is revalidated
- If mismatch detected → session revoked

## Example Flow
```bash
await signup("User", "user@mail.com", "secret");
await login("user@mail.com", "secret");

const status = await verifySession();
console.log(status); // { valid: true }
```

## Author
[Ashin Sabu Mathew](https://github.com/AshinSMathew)