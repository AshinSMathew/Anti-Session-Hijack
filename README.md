# Anti Session Hijack
A robust server-side SDK for preventing session hijacking by binding user sessions to a unique browser fingerprint. This package ensures that stolen session tokens cannot be reused from different browsers or devices.

### Features
- Session Hijacking Prevention - Binds sessions to browser fingerprints
- Automatic Detection - Detects and responds to hijacking attempts
- JWT-based Authentication - Secure token-based sessions
- UUID Support - Uses UUIDs instead of sequential IDs for better security
- Database Agnostic - Works with any PostgreSQL-compatible database

### Installation
```bash
npm i anti-session-hijack
```
### Peer Dependencies
```bash
npm install @neondatabase/serverless bcryptjs jose
```

### Database Setup
1. Create Required Tables
Run these SQL commands in your PostgreSQL database:
```bash
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    auth_token_hash VARCHAR(255) NOT NULL,
    fingerprint VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, fingerprint)
);
```

2. Environment Variables
Create a .env file:
```bash
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secure_jwt_secret_key
```

### Usage
Importing Functions
```bash
import { 
  signup, 
  login, 
  verifySession, 
} from 'anti-session-hijack';
```

### API Reference
1. `signup(input, db)`
Creates a new user account.

##### Parameters:
- input: SignupInput - User registration data
```bash
{
  name: string;      // User's full name
  email: string;     // User's email (must be unique)
  password: string;  // User's password (min 6 characters)
}
```
- db: any - Database connection instance (e.g., NeonDB connection)

##### Returns: Promise<SignupResult>
```bash
{
  id: string;          // UUID of the created user
  name: string;        // User's name
  email: string;       // User's email
  created_at: string;  // Creation timestamp
}
```
##### Example:
```bash
import { neon } from '@neondatabase/serverless';

const db = neon(process.env.DATABASE_URL!);

const newUser = await signup(
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securepassword123'
  },
  db
);
```
2. `login(input, db, fingerprint, options)`
Authenticates a user and creates a session.

##### Parameters:
- input: LoginInput - User credentials
```bash
{
  email: string;     // User's email
  password: string;  // User's password
}
```
- db: any - Database connection instance
- fingerprint: string - Browser fingerprint (see Fingerprint Generation section)
- options: DBOptions - Configuration options
```bash
{
  jwtSecret: string;           // Secret key for JWT signing
  jwtExpiry?: string;          // Optional (default: '7d')
}
```
##### Returns: Promise<LoginResult>
```bash
{
  token: string;       // JWT token (store in HttpOnly cookie)
  user: {
    id: string;        // User UUID
    name: string;      // User's name
    email: string;     // User's email
  }
}
```
##### Example:
```bash
// Client-side: Generate fingerprint
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const fp = await FingerprintJS.load();
const result = await fp.get();
const fingerprint = result.visitorId;

// Server-side: Login
const loginResult = await login(
  {
    email: 'john@example.com',
    password: 'securepassword123'
  },
  db,
  fingerprint,
  {
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiry: '7d'
  }
);

// Set HttpOnly cookie
response.cookies.set('authToken', loginResult.token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60
});
```

3. `verifySession(input, db, fingerprint, options)`
Verifies a session's validity and detects hijacking attempts.
##### Parameters:
- input: VerifyInput - Session verification data
```bash
{
  fingerprint: string;
  
}
```
- db: any - Database connection instance
- fingerprint: string - Current browser fingerprint
- options: DBOptions - Configuration options

##### Returns: Promise<VerifyResult>
```bash
{
  valid: boolean;       // Whether session is valid
  hijacked?: boolean;   // Whether hijacking was detected
  user?: {              // User data (if valid)
    id: string;
    name: string;
    email: string;
  }
}
```
##### Example:
```bash
const authToken = request.cookies.get('authToken')?.value;

const verification = await verifySession(
  { authToken },
  db,
  fingerprint,
  {
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiry: '7d'
  }
);

if (!verification.valid) {
  if (verification.hijacked) {
    // Alert user and force logout
    console.error('Session hijacking detected!');
  }
  // Redirect to login
}
```

## Fingerprint Generation
### Option 1: Using FingerprintJS (Recommended)
```bash
npm install @fingerprintjs/fingerprintjs
```
```typescript
// Client-side implementation
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function getBrowserFingerprint(): Promise<string> {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
}

// Send fingerprint with login/verification requests
const fingerprint = await getBrowserFingerprint();
```
### Option 2: Custom Fingerprint Algorithm
Create your own fingerprint using browser properties:

## Security Implementation
Next.js API Route Example
`app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { login } from "anti-session-hijack";

export async function POST(request: NextRequest) {
  try {
    const { email, password, fingerprint } = await request.json();

    if (!email || !password || !fingerprint) {
      return NextResponse.json(
        { error: "Email, password, and fingerprint are required" },
        { status: 400 }
      );
    }

    const result = await login(
      { email, password },
      db,
      fingerprint,
      {
        jwtSecret: process.env.JWT_SECRET!,
        jwtExpiry: "7d"
      }
    );

    const response = NextResponse.json({
      message: "Login successful",
      user: result.user
    });

    response.cookies.set("authToken", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
```
`app/api/verify-session/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession } from "anti-session-hijack";

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get("authToken")?.value;
    const { fingerprint } = await request.json();

    if (!authToken || !fingerprint) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const result = await verifySession(
      { authToken },
      db,
      fingerprint,
      {
        jwtSecret: process.env.JWT_SECRET!,
        jwtExpiry: "7d"
      }
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
```

## Author
[Ashin Sabu Mathew](https://github.com/AshinSMathew)