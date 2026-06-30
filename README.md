<h1 align="center"> Calendar Money API </h1>

<p align="center">
💚 REST API built with Node.js, Express and MongoDB. JWT-based auth, full CRUD for users / categories / transactions, and a bulk endpoint for CSV backups.
</p>

<br>

## 🌐 Live demo

- The API is deployed on Render and intended to run together with the **[calendar-money](https://github.com/nady4/calendar-money)** frontend.
- The frontend defaults to `https://calendar-money-api.onrender.com`; you can override it with `VITE_API_URL` at build time.

<br>

## ✨ Features

### 🔐 Auth

- **Register** — `POST /register` validates username (3–20 chars), email (RFC format) and password (≥ 8 chars, must contain letters and digits) with **Zod**, hashes the password with **bcrypt** (10 rounds) and creates the user with a default set of categories plus a couple of demo transactions. Returns the full populated user object.
- **Login** — `POST /login` looks up the user by username, compares the password with bcrypt and signs a **JWT** (`{ id, username }`) with a 7-day expiry. The token is what the frontend stores and sends as `Authorization: Bearer <token>`.
- **Logout** — `POST /logout` clears the legacy `user` and `token` cookies. JWT-based stateless logout is handled client-side.
- **Token verification** — `verifyToken` middleware reads `Authorization: Bearer …`, checks the secret (`JWT_SECRET` or `JWT_KEY`) and rejects with 401 / 403 / 500 depending on the failure mode. If the route has a `:userId` param, the token's `id` must match it — no cross-user access.

### 👤 Users

- **Get** — `GET /users/:userId` returns the user with `categories` and `transactions` fully populated (transactions also have their `category` populated). Invalid ObjectId gets a 400, missing user a 404.
- **Update** — `PUT /users/:userId` accepts `username`, `email`, and `password` (hashed on the fly if present) and bumps `updatedAt`. Returns the populated user.
- **Delete** — `DELETE /users/:userId` cascade-deletes all of the user's categories and transactions, then the user itself.

### 🗂️ Categories

- **Create** — `POST /categories/:userId` saves the category and pushes its `_id` onto `user.categories`. Type is `income` or `expense`.
- **Update** — `PUT /categories/:userId` updates name, color, type.
- **Delete** — `DELETE /categories/:userId` removes the category from the user **and** deletes every transaction that referenced it (`Transaction.deleteMany({ category: id })`) so no orphan rows survive.

### 💸 Transactions

- **Create** — `POST /transactions/:userId` saves the transaction, pushes its `_id` onto `user.transactions`, and **expands repeats** when `repeats` is `weekly` or `monthly` — generating **12 future copies** tagged with a shared `group` uuid (`uuidv4()`). Non-repeating transactions get `group: null`. Weekly uses `setDate(+i*7)`, monthly uses `setMonth(+i)` so DST and end-of-month edge cases stay correct.
- **Update** — `PUT /transactions/:userId` updates one transaction and, if a `group` is provided, propagates the change to **every transaction in the series** with `updateMany({ group })`. Returns the populated user.
- **Delete** — `DELETE /transactions/:userId` removes the row from `user.transactions` and, if a `group` exists, `deleteMany({ group })` for the whole series; otherwise just deletes the one document.
- **Bulk import** — `POST /transactions/bulk/:userId` is the entry point for the frontend's CSV restore. It accepts `{ categories, transactions }` with a hard cap of **5000 combined items**. Existing categories are matched by name (to keep references stable across exports), missing categories are created, and transactions are inserted as-is — including any `group` uuid from the export, so repeat series round-trip through CSV.
- **Scan invoice** — `POST /transactions/scan/:userId` accepts a `multipart/form-data` upload with an `image` field (invoice/receipt photo) plus an optional `existingCategories` JSON-string field. It proxies the image to a vision-capable AI model (provider-agnostic OpenAI-compatible endpoint) and returns draft transactions — `{ date: "YYYY-MM-DD"|null, transactions: [{ date?, amount, description, categoryName, categoryType, color }] }`. **This endpoint performs no database writes**; persistence is done by reusing the bulk import endpoint. Categories are auto-created there from the AI-suggested names.
- **Populated responses** — every controller returns the fully populated user (categories + transactions-with-category), so the frontend never needs a second request to render the dashboard.

### 🧰 Cross-cutting

- **CORS** is open (`origin: "*"`) so the static-hosted frontend can hit it from any origin. Tighten with `origin` in `src/index.ts` for production.
- **Self-ping** — `src/util/selfPing.ts` keeps the Render free tier awake by pinging the server periodically (loaded in `src/index.ts`).
- **Graceful .env loading** — `src/index.ts` calls `process.loadEnvFile()` and falls back to "production environment" if no `.env` is present, so the same binary runs locally and on Render.
- **Pretty logs** — emojis on success / error (✅ / 🚫 / 🟢 / 🔴 / 💚) so the Render logs are scannable at a glance.
- **Scan proxy** — `POST /transactions/scan/:userId` forwards an invoice image to a vision model via `multer` (memory storage, 10 MB cap). The AI key stays server-side; the frontend only sends the image. Configure with `VISION_API_BASE`, `VISION_API_KEY`, `VISION_MODEL` (+ optional `VISION_API_MAX_BYTES`). The controller targets an OpenAI-compatible `/chat/completions` endpoint, so on the **OpenCode Go** subscription set `VISION_API_BASE=https://opencode.ai/zen/go/v1` and `VISION_MODEL=kimi-k2.6` (verified end-to-end against an invoice image). Known working vision models on Go: `kimi-k2.6` (recommended, $0.95/$4.00), `kimi-k2.7-code`, `mimo-v2.5` (cheapest, $0.14/$0.28, sometimes misses lines). Known to reject image input on Go: `glm-5.2`, `glm-5.1` (accepts but extracts nothing), `deepseek-v4-pro`, `deepseek-v4-flash`, `mimo-v2.5-pro`. Do **not** send `response_format: json_object` — Go's gateway does not support it with image input; the controller parses the JSON out of the model's text content. Go models that use the Anthropic `/messages` shape (MiniMax M3 / Qwen3.7) are not supported by the current implementation.

<br>

## 🛠️ Tech stack

| Area                | Technology                              |
| ------------------- | --------------------------------------- |
| Runtime             | Node.js 18+                              |
| Language            | TypeScript 5.6                            |
| HTTP framework      | Express 4.21                              |
| ODM                 | Mongoose 8.8                              |
| Database            | MongoDB                                   |
| Auth                | `jsonwebtoken` + `bcrypt`                 |
| Validation          | `zod`                                      |
| CORS                | `cors`                                      |
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
│   │   ├── userRoutes.ts         # /users/:userId
│   │   ├── categoriesRoutes.ts   # /categories/:userId
│   │   └── transactionsRoutes.ts # /transactions/:userId + /transactions/bulk/:userId
│   ├── controllers/
│   │   ├── auth.ts             # Zod-validated register / login / logout
│   │   ├── users.ts            # get / update / delete
│   │   ├── categories.ts       # create / update / delete (cascades to transactions)
│   │   └── transactions.ts     # create / update / delete / bulkImport
│   ├── models/
│   │   ├── User.ts             # username, email, password, transactions[], categories[], createdAt, updatedAt
│   │   ├── Category.ts         # name, color, type
│   │   └── Transaction.ts      # date, amount, description, category, group
│   ├── middlewares/
│   │   └── verifyToken.ts      # JWT + userId check
│   ├── util/
│   │   ├── connectDB.ts        # Mongoose connect
│   │   ├── defaultData.ts      # Seed categories + demo transactions
│   │   └── selfPing.ts         # Keep-alive for free-tier hosts
│   └── scripts/
│       └── seedUser.ts         # CLI: `pnpm run seed` — create a demo user
├── src/assets/docs/            # README screenshots
└── package.json
```

### 🗄️ Data model

**`User`**
- `username: string` (required)
- `email: string` (required, unique)
- `password: string` (required, bcrypt hash)
- `transactions: ObjectId[]` → `Transaction`
- `categories: ObjectId[]` → `Category`
- `createdAt: Date`, `updatedAt: Date`

**`Category`**
- `name: string` (required)
- `color: string` (required, hex)
- `type: "income" | "expense"` (required)

**`Transaction`**
- `date: Date` (required)
- `amount: number` (required)
- `description: string` (required)
- `category: ObjectId` → `Category` (required)
- `group: string` (optional, uuid — shared by all rows in a repeat series)

### 🔌 Endpoints

| Method   | Path                              | Auth | Notes                                                        |
| -------- | --------------------------------- | ---- | ------------------------------------------------------------ |
| `POST`   | `/register`                       | No   | Zod-validated; seeds default categories + demo transactions. |
| `POST`   | `/login`                          | No   | Returns `{ token, user }`.                                   |
| `POST`   | `/logout`                         | No   | Clears legacy cookies.                                       |
| `GET`    | `/users/:userId`                  | Yes  | Fully populated user.                                        |
| `PUT`    | `/users/:userId`                  | Yes  | Update username / email / password.                          |
| `DELETE` | `/users/:userId`                  | Yes  | Cascades to categories + transactions.                       |
| `POST`   | `/categories/:userId`             | Yes  | Create a category.                                           |
| `PUT`    | `/categories/:userId`             | Yes  | Update a category.                                           |
| `DELETE` | `/categories/:userId`             | Yes  | Deletes the category and all its transactions.               |
| `POST`   | `/transactions/:userId`           | Yes  | Create; expands repeats up to 12 future rows.                |
| `PUT`    | `/transactions/:userId`           | Yes  | Update; propagates by `group` when present.                  |
| `DELETE` | `/transactions/:userId`           | Yes  | Delete; cascades by `group` when present.                    |
| `POST`   | `/transactions/bulk/:userId`      | Yes  | CSV import — 5000-item cap, creates missing categories.      |

### 🔍 Notable implementation details

- **Repeat expansion is server-side** — the frontend never re-creates rows. The frontend's CSV export uses the same shape as the DB (including `_id`, `category`, `group`), so the bulk import is a faithful round-trip and re-importing a backup into a fresh account preserves repeat series.
- **`verifyToken` checks the URL's `:userId`** against the JWT's `id`, not just the secret. A valid token for user A can't touch user B's data, even if both IDs are in the system.
- **Controllers return the populated user, not the doc that was touched.** This is the frontend's contract — every `POST` / `PUT` / `DELETE` response is the new full state of the user, ready to drop into the store.
- **Hard caps** — `REPEAT_LIMIT = 12` for repeat expansion, `BULK_LIMIT = 5000` for bulk import. Both are server-side guards against accidental runaway payloads.
- **No-body 401 vs 403 vs 500** — the middleware differentiates: `JsonWebTokenError` → 401 (bad token), `AuthError` (no header / format / mismatch) → 403 (authentication failed), and anything else → 500. The frontend maps the status to a useful message.

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
```

> ⚠️ `JWT_SECRET` must match across deploys. Rotating it invalidates every outstanding token.

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
pnpm run seed
```

Creates a user you can log into from the frontend so the dashboard isn't empty on first run.

<br>

## 📜 Scripts

| Command          | Description                                  |
| ---------------- | -------------------------------------------- |
| `pnpm run dev`   | Start the dev server with live reload        |
| `pnpm run build` | Compile TypeScript to `dist/`                |
| `pnpm start`     | Run the compiled server                      |
| `pnpm run seed`  | Insert a demo user (categories + transactions) |

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
