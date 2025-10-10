// server/index.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ExpressBrute = require('express-brute');
let ExpressBruteRedis;
let Redis;

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // adjust origin to your dev URL
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const REDIS_URL = process.env.REDIS_URL || ''; // set in production env if you have one

// --- simple in-memory "user store" for demo (replace with DB in production) ---
const users = new Map(); // key: username/email, value: { passwordHash }

// --- create express-brute store (Redis if available, otherwise MemoryStore) ---
let store;
(async () => {
  try {
    if (REDIS_URL) {
      Redis = require('redis');
      ExpressBruteRedis = require('express-brute-redis');
      const client = Redis.createClient({ url: REDIS_URL });
      client.on('error', (err) => console.error('Redis client error', err));
      await client.connect();
      store = new ExpressBruteRedis({ client, prefix: 'brute' });
      console.log('Using Redis store for express-brute');
    } else {
      // MemoryStore from express-brute
      store = new ExpressBrute.MemoryStore();
      console.log('Using MemoryStore for express-brute (dev only)');
    }
  } catch (err) {
    console.error('Error configuring brute store:', err);
    store = new ExpressBrute.MemoryStore();
  }
})();

// small helper to wait until store is ready if async -> but for simplicity we'll assume store set quickly

// --- helper: create a brute instance with shared store + sensible defaults ---
function createBrute(opts = {}) {
  return new ExpressBrute(store, Object.assign({
    freeRetries: 5,
    minWait: 5 * 60 * 1000,    // 5 minutes
    maxWait: 60 * 60 * 1000,   // 1 hour
    lifetime: 24 * 60 * 60,    // seconds
    handleStoreError: (err) => console.error('Brute store error:', err),
    failCallback: (req, res /*, next, nextValidRequestDate */) => {
      return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    }
  }, opts));
}

// default brute for login route
const loginBrute = createBrute();
// separate stricter brute for registration
const registerBrute = createBrute({
  freeRetries: 3,
  minWait: 10 * 60 * 1000,
  maxWait: 24 * 60 * 60 * 1000,
  lifetime: 7 * 24 * 60 * 60
});

// --- Utility: protect by username+ip instead of pure IP ---
// express-brute uses req.ip. We temporarily override req.ip with a compound key
function preventByUsername(bruteInstance, usernameExtractor) {
  return (req, res, next) => {
    const key = (usernameExtractor && usernameExtractor(req)) || req.ip || '';
    // form a composite key so the store keys differ per username+ip
    const composite = `user:${key}|ip:${req.ip || 'unknown'}`;
    const originalIp = req.ip;
    // override ip for brute to use as key
    Object.defineProperty(req, 'ip', { value: composite });
    const cleanup = () => {
      Object.defineProperty(req, 'ip', { value: originalIp });
    };
    bruteInstance.prevent(req, res, (err) => {
      cleanup();
      next(err);
    });
  };
}

// --- Auth helpers (demo) ---
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// --- ROUTES ---

// Register (protected by registerBrute)
app.post('/api/register', preventByUsername(registerBrute, (req) => req.body.username || req.body.email), async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  if (users.has(username)) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.set(username, { passwordHash });
  return res.json({ ok: true });
});

// Login (protected by loginBrute). On success we call brute.reset(req) to clear attempts.
app.post('/api/login', preventByUsername(loginBrute, (req) => req.body.username || req.body.email), async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  const user = users.get(username);
  const ok = user && await bcrypt.compare(password, user.passwordHash);

  if (!ok) {
    // express-brute has already incremented the stored attempts for the request
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Successful login -> reset brute counter for this req
  try {
    await new Promise((resolve, reject) => loginBrute.reset(req, (err) => (err ? reject(err) : resolve())));
  } catch (err) {
    console.warn('Failed to reset brute counter:', err);
  }

  const token = signToken({ username });
  return res.json({ ok: true, token });
});

// Example protected dashboard data
app.get('/api/dashboard', authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}`, secretData: '42' });
});

// Password-reset request endpoint example (protect to avoid enumeration/abuse)
const resetBrute = createBrute({ freeRetries: 5, minWait: 30 * 60 * 1000, lifetime: 24 * 60 * 60 });
app.post('/api/password-reset', preventByUsername(resetBrute, (req) => req.body.email || req.body.username), (req, res) => {
  // In real flow: send email if user exists. But always return same response to avoid enumeration.
  res.json({ ok: true });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth server listening on ${PORT}`));
