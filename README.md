<h1 align="center"> Calendar Money API </h1>

<p align="center">
💚 REST API built with Node.js, Express and MongoDB. JWT-based auth, full CRUD for users / categories / transactions, a bulk endpoint for CSV backups, and an AI-powered invoice scan with per-user quota + BYOK.
</p>

<br>

## 🌐 Live demo

- The API is deployed on Render and intended to run together with the **[calendar-money](https://github.com/nady4/calendar-money)** frontend.
- The frontend defaults to `https://calendar-money-api.onrender.com`; you can override it with `VITE_API_URL` at build time.

<br>

## ✨ Features

### 🔐 Auth

- **Register** — `POST /register` validates username (3–20 chars), email (RFC format) and password (≥ 8 chars, must contain letters and digits) with **Zod**, hashes the password with **bcrypt** (10 rounds) and creates the user with a default set of categories plus a year+ of demo transactions (recurring monthly series like salary / rent / utilities, variable expenses, and one-off big-ticket items). Returns `{ success: true, user }` — no token is issued; call `/login` to obtain one.
- **Login** — `POST /login` looks up the user by username, compares the password with bcrypt and signs a **JWT** (`{ id, username }`) with a 7-day expiry. The token is what the frontend stores and sends as `Authorization: Bearer <token>`.
- **Logout** — `POST /logout` clears the legacy `user` and `token` cookies. JWT-based stateless logout is handled client-side.
- **Token verification** — `verifyToken` middleware reads `Authorization: Bearer …`, checks the secret (`JWT_SECRET` or `JWT_KEY`) and rejects with 401 / 403 / 500 depending on the failure mode. If the route has a `:userId` param, the token's `id` must match it — no cross-user access.

### 👤 Users

- **Get** — `GET /users/:userId` returns the user with `categories` and `transactions` fully populated (transactions also have their `category` populated). Invalid ObjectId gets a 400, missing user a 404.
- **Update** — `PUT /users/:userId` accepts `username`, `email`, and `password` (hashed on the fly if present) and bumps `updatedAt`. Returns the populated user.
- **Delete** — `DELETE /users/:userId` cascade-deletes all of the user's categories and transactions, then the user itself.

### 🗂️ Categories

- **Create** — `POST /categories/:userId` saves the category and pushes its `_id` onto `user.categories`. The seed and the AI scan use `"Income"` / `"Expense"` (capitalized); the schema itself is an unconstrained string.
- **Update** — `PUT /categories/:userId` updates name, color, type.
- **Delete** — `DELETE /categories/:userId` removes the category from the user **and** deletes every transaction that referenced it (`Transaction.deleteMany({ category: id })`) so no orphan rows survive.

### 💸 Transactions

- **Create** — `POST /transactions/:userId` saves the transaction, pushes its `_id` onto `user.transactions`, and **expands repeats** when `repeats` is `weekly` or `monthly` — generating **12 future copies** tagged with a shared `group` uuid (`uuidv4()`). Non-repeating transactions get `group: null`. Weekly uses `setDate(+i*7)`, monthly uses `setMonth(+i)` so DST and end-of-month edge cases stay correct.
- **Update** — `PUT /transactions/:userId` updates one transaction and, if a `group` is provided, propagates the change to **every transaction in the series** with `updateMany({ group })`. Returns the populated user.
- **Delete** — `DELETE /transactions/:userId` removes the row from `user.transactions` and, if a `group` exists, `deleteMany({ group })` for the whole series; otherwise just deletes the one document.
- **Bulk import** — `POST /transactions/bulk/:userId` is the entry point for the frontend's CSV restore. It accepts `{ categories, transactions }` with a hard cap of **5000 combined items**. Existing categories are matched by name (to keep references stable across exports), missing categories are created, and transactions are inserted as-is — including any `group` uuid from the export, so repeat series round-trip through CSV.
- **Scan invoice** — `POST /transactions/scan/:userId` accepts a `multipart/form-data` upload with an `image` field (invoice/receipt photo) plus optional `existingCategories` (JSON-string array of category names the model should prefer) and `useMyKey` (`"true"` / `true`, see BYOK below). It proxies the image to a vision-capable AI model (provider-agnostic OpenAI-compatible endpoint) and returns draft transactions — `{ success, date: "YYYY-MM-DD"|null, transactions: [{ date?, amount, description, categoryName, categoryType: "Income"|"Expense", color }], quota, byok }`. **This endpoint performs no database writes**; persistence is done by reusing the bulk import endpoint. Categories are auto-created there from the AI-suggested names.
- **Scan quota** — `GET /users/:userId/scan-quota` returns the user's current usage snapshot (`{ usedDay, limitDay, usedMonth, limitMonth, resetsAt }`) plus a `byok` flag indicating whether the user has saved a personal vision key. Scans backed by the server key are rate-limited per UTC day and per UTC month (`SCAN_DAILY_LIMIT` / `SCAN_MONTHLY_LIMIT`, defaults `10` / `100`); over-quota requests respond with `429 Daily scan limit reached.` Scans that use the user's own key (BYOK) **bypass the server-side quota** because the cost is on the user.
- **Populated responses** — every controller returns the fully populated user (categories + transactions-with-category), so the frontend never needs a second request to render the dashboard.

### 🧰 Cross-cutting

- **CORS** is open (`origin: "*"`) so the static-hosted frontend can hit it from any origin. Tighten with `origin` in `src/index.ts` for production.
- **Self-ping** — `src/util/selfPing.ts` keeps the Render free tier awake by pinging `https://calendar-money-api.onrender.com` every **30 seconds**. The loop only starts when `NODE_ENV === "production"` (loaded as a side-effect import in `src/index.ts`).
- **Graceful .env loading** — `src/index.ts` calls `process.loadEnvFile()` and falls back to "production environment" if no `.env` is present, so the same binary runs locally and on Render.
- **Pretty logs** — emojis on success / error (✅ / 🚫 / 🟢 / 🔴 / 💚) so the Render logs are scannable at a glance.
- **Scan proxy** — `POST /transactions/scan/:userId` forwards an invoice image to a vision model via `multer` (memory storage, 10 MB cap, JPEG/PNG/WebP only). The AI key stays server-side; the frontend only sends the image. Configure with `VISION_API_BASE`, `VISION_API_KEY`, `VISION_MODEL` (+ optional `VISION_API_MAX_BYTES`). The controller targets an OpenAI-compatible `/chat/completions` endpoint, so on the **OpenCode Go** subscription set `VISION_API_BASE=https://opencode.ai/zen/go/v1` and `VISION_MODEL=kimi-k2.6` (verified end-to-end against an invoice image). Known working vision models on Go: `kimi-k2.6` (recommended, $0.95/$4.00), `kimi-k2.7-code`, `mimo-v2.5` (cheapest, $0.14/$0.28, sometimes misses lines). Known to reject image input on Go: `glm-5.2`, `glm-5.1` (accepts but extracts nothing), `deepseek-v4-pro`, `deepseek-v4-flash`, `mimo-v2.5-pro`. Do **not** send `response_format: json_object` — Go's gateway does not support it with image input; the controller parses the JSON out of the model's text content. Go models that use the Anthropic `/messages` shape (MiniMax M3 / Qwen3.7) are not supported by the current implementation. A streaming-read guard caps the model's response at 64 KB.
- **Multer error handling** — `src/middlewares/handleMulterError.ts` translates multer errors into clean HTTP responses: `LIMIT_FILE_SIZE` → `413` with a "10 MB" message, `Unsupported file type` → `415`, and any other `MulterError` → `400`. Other errors fall through to the next middleware.
- **Bring-your-own-key (BYOK) for the vision API** — Users can opt out of the server-side quota and pay for their own inference by storing a personal API key on their account.
  - `GET /users/:userId/vision-key` returns `{ hasKey, lastFour }` (`lastFour` is always `null` from the server; the frontend keeps the masked display locally).
  - `PUT /users/:userId/vision-key` accepts `{ key }` (≥ 8 chars), validates it against the provider's `/models` endpoint with a `Bearer` header before saving, and stores it encrypted-at-rest on the user document. `401` / `403` from the provider are surfaced as `400 The key was rejected by the vision provider.` Any other provider status is forwarded with the same code.
  - `DELETE /users/:userId/vision-key` nulls the stored ciphertext (the row is kept for schema stability, the values are zeroed out).
  - **Encryption** — `src/util/crypto.ts` encrypts keys with **AES-256-GCM**. `BYOK_ENCRYPTION_KEY` is the source: a 32-byte raw string is taken as utf-8; a 64-char hex string is decoded to 32 bytes. Each save generates a fresh 12-byte IV; the auth tag is stored alongside the ciphertext. A wrong-length key throws on first use. The server never returns the key in plaintext, and `maskKey(plaintext)` produces `••••<last4>` for safe display in the UI.

<br>

## 🛠️ Tech stack

| Area                | Technology                              |
| ------------------- | --------------------------------------- |
| Runtime             | Node.js 18+                              |
| Language            | TypeScript 5.8                            |
| HTTP framework      | Express 4.21                              |
| ODM                 | Mongoose 8.8                              |
| Database            | MongoDB                                   |
| Auth                | `jsonwebtoken` + `bcrypt`                 |
| Validation          | `zod`                                      |
| CORS                | `cors`                                      |
| File uploads        | `multer` (memory storage, 10 MB cap)      |
| BYOK encryption     | Node `crypto` (AES-256-GCM)               |
| Env loading         | `process.loadEnvFile()` (Node 20.6+ built-in) |
| Dev runner          | `ts-node-dev` (live reload)               |
| Misc                | `uuid` for group ids                      |
| Deployment          | Render (free tier, with self-ping)        |

<br>

## 🏗️ Architecture

```
calendar-money-api/
├── src/
│   ├── index.ts                # Express bootstrap, .env, CORS, routes, self-ping
│   ├── routes/
│   │   ├── authRoutes.ts         # /register, /login, /logout
│   │   ├── userRoutes.ts         # /users/:userId + /users/:userId/vision-key
│   │   ├── categoriesRoutes.ts   # /categories/:userId
│   │   └── transactionsRoutes.ts # /transactions/:userId + bulk + scan + /users/:userId/scan-quota
│   ├── controllers/
│   │   ├── auth.ts             # Zod-validated register / login / logout
│   │   ├── users.ts            # get / update / delete
│   │   ├── categories.ts       # create / update / delete (cascades to transactions)
│   │   ├── transactions.ts     # create / update / delete / bulkImport
│   │   ├── scan.ts             # scanInvoice (multer) + getScanQuota
│   │   └── visionKey.ts        # setVisionKey / removeVisionKey / getVisionKeyStatus (BYOK)
│   ├── models/
│   │   ├── User.ts             # username, email, password, transactions[], categories[], scanUsage, visionApiKeyEnc, createdAt, updatedAt
│   │   ├── Category.ts         # name, color, type
│   │   └── Transaction.ts      # date, amount, description, category, group
│   ├── middlewares/
│   │   ├── verifyToken.ts      # JWT + userId check
│   │   └── handleMulterError.ts# Multer error → 413 / 415 / 400 translator
│   ├── util/
│   │   ├── connectDB.ts        # Mongoose connect
│   │   ├── defaultData.ts      # Seed categories + demo transactions
│   │   ├── crypto.ts           # AES-256-GCM encrypt / decrypt / mask (BYOK)
│   │   └── selfPing.ts         # Keep-alive for free-tier hosts
│   └── scripts/
│       ├── seedUser.ts         # CLI: `pnpm run seed` — create a demo user (--keep to skip wipe)
│       └── resetScanQuota.ts   # CLI: `pnpm run reset-quota` — zero scan counters on the seed user
├── src/assets/docs/            # README screenshots
└── package.json
```

### 🗄️ Data model

**`User`**
- `username: string` (required)
- `email: string` (required, unique index)
- `password: string` (required, bcrypt hash)
- `transactions: ObjectId[]` → `Transaction`
- `categories: ObjectId[]` → `Category`
- `scanUsage: { day: string, dayCount: number, month: string, monthCount: number, lastScanAt: Date | null }` — per-user counters keyed by UTC day (`YYYY-MM-DD`) and UTC month (`YYYY-MM`). The controller rewrites them on every scan (zeroing them out when the day / month rolls over). `dayCount` / `monthCount` are only incremented for scans that go through the **server** key — BYOK scans bypass quota.
- `visionApiKeyEnc: { ciphertext: string | null, iv: string | null, authTag: string | null }` — AES-256-GCM-encrypted personal vision key (BYOK). `null` on all three fields means "no key stored".
- `createdAt: Date`, `updatedAt: Date`

**`Category`**
- `name: string` (required)
- `color: string` (required, hex)
- `type: string` (required; default seed and AI prompt use `"Income"` / `"Expense"`, capitalized — the schema itself is unconstrained to keep imports / migrations flexible)

**`Transaction`**
- `date: Date` (required)
- `amount: number` (required)
- `description: string` (required)
- `category: ObjectId` → `Category` (required)
- `group: string` (optional, uuid — shared by all rows in a repeat series)

### 🔌 Endpoints

| Method   | Path                                  | Auth | Notes                                                                                          |
| -------- | ------------------------------------- | ---- | ---------------------------------------------------------------------------------------------- |
| `POST`   | `/register`                           | No   | Zod-validated; seeds default categories + demo transactions. Returns `{ success, user }` (no token — call `/login` to obtain one). |
| `POST`   | `/login`                              | No   | Returns `{ success, token, user }` with the user fully populated.                              |
| `POST`   | `/logout`                             | No   | Clears legacy `user` / `token` cookies.                                                        |
| `GET`    | `/users/:userId`                      | Yes  | Fully populated user.                                                                          |
| `PUT`    | `/users/:userId`                      | Yes  | Update username / email / password.                                                            |
| `DELETE` | `/users/:userId`                      | Yes  | Cascades to categories + transactions.                                                         |
| `GET`    | `/users/:userId/scan-quota`           | Yes  | Current scan counters and limits (`{ usedDay, limitDay, usedMonth, limitMonth, resetsAt }`) + `byok` flag. |
| `GET`    | `/users/:userId/vision-key`           | Yes  | BYOK status — `{ hasKey, lastFour }`.                                                          |
| `PUT`    | `/users/:userId/vision-key`           | Yes  | BYOK set — validates `{ key }` against the provider before encrypting and saving.              |
| `DELETE` | `/users/:userId/vision-key`           | Yes  | BYOK remove — zeroes out the stored ciphertext.                                                |
| `POST`   | `/categories/:userId`                 | Yes  | Create a category.                                                                             |
| `PUT`    | `/categories/:userId`                 | Yes  | Update a category.                                                                             |
| `DELETE` | `/categories/:userId`                 | Yes  | Deletes the category and all its transactions.                                                 |
| `POST`   | `/transactions/:userId`               | Yes  | Create; expands repeats up to 12 future rows.                                                  |
| `PUT`    | `/transactions/:userId`               | Yes  | Update; propagates by `group` when present.                                                    |
| `DELETE` | `/transactions/:userId`               | Yes  | Delete; cascades by `group` when present.                                                      |
| `POST`   | `/transactions/bulk/:userId`          | Yes  | CSV import — 5000-item cap, creates missing categories. Returns `{ success, imported, user }`. |
| `POST`   | `/transactions/scan/:userId`          | Yes  | AI invoice scan — `multipart/form-data` with `image` (+ optional `existingCategories`, `useMyKey`). No DB writes. `415` for bad MIME, `413` for > 10 MB, `429` on quota, `503` if no provider is configured. |

### 🔍 Notable implementation details

- **Repeat expansion is server-side** — the frontend never re-creates rows. The frontend's CSV export uses the same shape as the DB (including `_id`, `category`, `group`), so the bulk import is a faithful round-trip and re-importing a backup into a fresh account preserves repeat series.
- **`verifyToken` checks the URL's `:userId`** against the JWT's `id`, not just the secret. A valid token for user A can't touch user B's data, even if both IDs are in the system.
- **Controllers return the populated user, not the doc that was touched.** This is the frontend's contract — every `POST` / `PUT` / `DELETE` response is the new full state of the user, ready to drop into the store.
- **Hard caps** — `REPEAT_LIMIT = 12` for repeat expansion, `BULK_LIMIT = 5000` for bulk import, `10 MB` for scan uploads, and `64 KB` for the AI model's response body. All are server-side guards against accidental runaway payloads.
- **No-body 401 vs 403 vs 500** — the middleware differentiates: `JsonWebTokenError` → 401 (bad token), `AuthError` (no header / format / mismatch) → 403 (authentication failed), and anything else → 500. The frontend maps the status to a useful message.
- **Scan quota is per-user, per-UTC window** — `day` is keyed `YYYY-MM-DD` (UTC) and `month` is keyed `YYYY-MM` (UTC). The controller re-reads the `scanUsage` snapshot, normalizes it to "today" / "this month" (resetting to `0` when the key rolls over), then increments and writes it back. This is safe against clock skew inside one process and is the only place the counters are written.
- **BYOK validation is round-trip, not just format** — `PUT /users/:userId/vision-key` calls the provider's `/models` endpoint with the candidate key before saving. A `200` saves it encrypted, `401` / `403` becomes a clear `400 The key was rejected by the vision provider.`, any other status is forwarded with the same code, and network errors are surfaced as `Could not reach the vision provider: <reason>`.
- **BYOK encryption is per-record** — every save generates a fresh 12-byte IV; the auth tag is stored alongside the ciphertext. Rotating `BYOK_ENCRYPTION_KEY` is the only way to invalidate every stored key in one shot, and is also the only safe way to migrate (old rows will simply fail to decrypt on the next BYOK scan, and the user re-saves).
- **Scan response is a draft, never persisted** — `POST /transactions/scan/:userId` returns `date` + `transactions[]` and the frontend is expected to feed them straight into `POST /transactions/bulk/:userId` (which is what auto-creates missing categories). The scan endpoint never writes the DB.
- **`existingCategories` is a hint, not a constraint** — the field is parsed from a JSON-string body part (`multipart/form-data` has no native arrays) and forwarded to the model in the user prompt. If the field is missing or malformed, the controller falls back to the user's currently-stored category names. Category matching in the bulk import is by name (case-sensitive), so consistency between the scan-time hint and the import-time match is the frontend's job.
- **`repeats` is request-only** — the `Transaction` model does **not** persist a `repeats` flag. The create controller reads `repeats` (`"weekly"` or `"monthly"`) to generate up to 12 future copies that share a `group` uuid; everything else in the system is driven by `group` alone. Sending `repeats` on update is a no-op.

<br>

## 🚀 Getting started

### 📋 Prerequisites

- [Node.js](https://nodejs.org) 18+
- A running [MongoDB](https://www.mongodb.com/) instance (local Docker, Atlas free tier, etc.)

### 📦 Installation

```sh
# 📥 Clone the repository
git clone https://github.com/nady4/calendar-money-api

# 📂 Move to the project folder
cd calendar-money-api

# 📦 Install dependencies
pnpm install
```

### 🔑 Environment setup

Create a `.env` file in the project root:

```env
# 🌐 Port the Express server listens on
PORT=3000

# 🍃 MongoDB connection string (MONGODB_URL is also accepted)
DB_URL=mongodb://127.0.0.1:27017/calendar-money

# 🔐 JWT signing secret (JWT_KEY is also accepted)
JWT_SECRET=replace-with-a-long-random-string

# 🔑 32-byte key used to encrypt users' BYOK vision keys at rest.
#    Either a 32-char utf-8 string OR a 64-char hex string.
BYOK_ENCRYPTION_KEY=replace-with-32-bytes-of-random-data

# 🤖 Vision provider (OpenAI-compatible /chat/completions endpoint).
#    Required for the scan feature to work.
VISION_API_BASE=https://api.example.com/v1
VISION_API_KEY=sk-...
VISION_MODEL=vision-model-id

# 🛡️ Optional scan safeguards
# VISION_API_MAX_BYTES=10485760   # reject uploads larger than 10 MB (default)
# SCAN_DAILY_LIMIT=10             # per-user scans / UTC day when using the server key (default 10)
# SCAN_MONTHLY_LIMIT=100          # per-user scans / UTC month when using the server key (default 100)

# 🚀 Set to "production" on Render — enables the self-ping loop.
NODE_ENV=production
```

> ⚠️ `JWT_SECRET` must match across deploys. Rotating it invalidates every outstanding token.
>
> ⚠️ `BYOK_ENCRYPTION_KEY` is the encryption root for every user's personal vision key. **Rotating it invalidates every stored BYOK key** — users will have to re-enter it.
>
> ⚠️ When `VISION_API_BASE` / `VISION_API_KEY` / `VISION_MODEL` are not set, `POST /transactions/scan/:userId` responds with `503 Vision provider not configured.` Scans that go through a user's stored BYOK key only need `VISION_API_BASE` + `VISION_MODEL` on the server — the user provides the key.

### 💻 Run the dev server

```sh
pnpm run dev
```

The server starts on `http://localhost:$PORT` (default `3000`) and live-reloads on save.

### 🏗️ Build for production

```sh
pnpm run build
pnpm start
```

`build` runs `tsc` and produces `dist/`; `start` runs the compiled `dist/index.js`.

### 🌱 Seed a demo user

```sh
pnpm run seed              # wipes and re-creates the demo user
pnpm run seed -- --keep    # keeps the user, just resets the scan quota
```

Creates a user (`nady4` / `dev@nady4.com`, password `nady4`) you can log into from the frontend so the dashboard isn't empty on first run. The seed bypasses the `/register` password rules so the short `nady4` password is allowed in dev. Run `pnpm run reset-quota` to zero scan counters without touching data.

<br>

## 📜 Scripts

| Command                      | Description                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `pnpm run dev`               | Start the dev server with live reload                                                                |
| `pnpm run build`             | Compile TypeScript to `dist/`                                                                        |
| `pnpm start`                 | Run the compiled server                                                                              |
| `pnpm run seed`              | Insert / re-insert the demo user (`nady4` / `dev@nady4.com`, password `nady4`) with default categories and transactions. Pass `-- --keep` to skip the wipe step (and just reset the scan quota). |
| `pnpm run reset-quota`       | Zero the scan counters on the seeded demo user without touching transactions / categories.           |

<br>

## 📝 Notes

- The frontend repo is **[calendar-money](https://github.com/nady4/calendar-money)**. Set `VITE_API_URL` in the frontend's `.env` if you're not using the default Render deployment.
- **CORS is wide open** (`origin: "*"`) for development convenience. In production, restrict `cors({ origin: ["https://your-frontend.example"] })` in `src/index.ts`.
- The **self-ping** (`src/util/selfPing.ts`) is meant for the Render free tier to keep the service awake. Disable it by removing the import in `src/index.ts` once you move to a paid plan.
- The `verifyToken` middleware accepts **either** `JWT_SECRET` or `JWT_KEY` (legacy). New deployments should standardize on `JWT_SECRET`.
- The **bulk endpoint** is intentionally permissive about `_id` formats: it accepts an incoming `_id` or falls back to `name:<name>` as a key, so the same payload works as an export-import and as a first-time import. Existing categories are matched by name to keep references stable.
- **Cascade deletes** are explicit: deleting a category deletes its transactions; deleting a user deletes everything they own. There is no soft-delete layer.

<br>

## 📬 Contact

### 💌 Email: **dev@nady4.com**

### 💼 LinkedIn: [nady4](https://www.linkedin.com/in/nady4)

### 👩🏻‍💻 GitHub: [@nady4](https://github.com/nady4)
