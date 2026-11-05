# Personal Finance Tracker

A simple, complete web app to track income and expenses, see spending with
charts, and manage a monthly budget. One user only ever sees their own data.

**Stack:** React 18 + Vite + Tailwind CSS (frontend) · Spring Boot 3.2.5 /
Java 17 + Spring Security + Spring Data MongoDB (backend) · MongoDB ·
JWT authentication · Axios · Recharts. No other frameworks or databases.

## Features

- **Register / Login / Logout** — passwords stored only as BCrypt hashes;
  every private API needs a JWT in the `Authorization: Bearer <token>` header.
  Wrong email or password returns 401 with a clear message.
- **Dashboard** — total income, total expenses, current balance, a pie chart
  of expenses by category, a bar chart of monthly income vs expenses, and the
  5 most recent transactions. It reloads from the backend, so it updates after
  you add or delete a transaction.
- **Transactions** — add income or expense with title, amount, type, category,
  date and optional notes; list all your transactions; filter by type,
  category or exact date; delete with confirmation; a friendly message when
  there is nothing to show.
- **Budget** — set one budget per month (saving again updates it), see budget
  vs spent vs remaining with a progress bar, and a red warning when expenses
  reach or exceed the budget.
- **Responsive UI** — sidebar navigation on desktop, top navigation on
  mobile; loading indicators, form validation, and success/error messages
  throughout. Amounts are displayed in INR (display only — the stored value
  is just a number, so change the formatter in the pages if you need another
  currency).

## Folder structure

```text
PersonalFinanceTracker/
├── README.md                  (this file — the only README)
├── .gitignore
├── client/                    (React frontend)
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js         (dev proxy: /api -> http://localhost:8080)
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            (routes, protected pages, sidebar layout)
│       ├── index.css
│       ├── api.js             (Axios instance + JWT header + 401 handling)
│       ├── AuthContext.jsx    (login state, kept in localStorage)
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Dashboard.jsx
│           ├── Transactions.jsx
│           └── Budget.jsx
└── server/                    (Spring Boot backend)
    ├── pom.xml
    └── src/main/java/com/finance/tracker/
        ├── FinanceTrackerApplication.java
        ├── model/             (User, Transaction, Budget)
        ├── repository/        (UserRepository, TransactionRepository, BudgetRepository)
        ├── security/          (JwtUtil, JwtAuthFilter, SecurityConfig)
        ├── service/           (AuthService, TransactionService, BudgetService)
        ├── controller/        (AuthController, TransactionController,
        │                       BudgetController, DashboardController,
        │                       GlobalExceptionHandler)
        └── dto/               (request/response records)
    └── src/main/resources/application.properties
```

## API endpoints

| Method | URL | What it does |
| ------ | --- | ------------ |
| POST | `/api/auth/register` | Register (name, email, password) — returns JWT |
| POST | `/api/auth/login` | Log in — returns JWT |
| GET | `/api/auth/me` | Current logged-in user (needs JWT) |
| POST | `/api/transactions` | Add a transaction |
| GET | `/api/transactions?type=&category=&date=` | List own transactions, filtered |
| DELETE | `/api/transactions/{id}` | Delete own transaction only |
| GET | `/api/dashboard` | Totals, category pie data, monthly bar data, recent 5 |
| POST | `/api/budgets` | Set/update the budget for a month (`month`, `amount`) |
| GET | `/api/budgets?month=2026-11` | Budget, spent, remaining, over-budget flag |

Ownership rule: transactions and budgets are always queried with the user id
taken from the JWT. Asking for another user's transaction id returns 404, and
all private endpoints without a token return 401.

## Environment variables

Set these **before** starting the backend. They are read from the environment,
never from code — there are no hardcoded secrets or database passwords.

| Variable | Where it is used | Default if not set |
| -------- | ---------------- | ------------------ |
| `MONGODB_URI` | `server/src/main/resources/application.properties` | `mongodb://localhost:27017/finance_tracker` |
| `JWT_SECRET` | Same file (`jwt.secret`) | None — a random key is generated at startup (tokens then stop working after a restart) |
| `JWT_EXPIRATION_MS` | Same file | `86400000` (24 hours) |
| `PORT` | Same file (`server.port`) | `8080` |
| `VITE_API_URL` | `client/src/api.js` | `/api` (Vite dev proxy forwards it to the backend) |

For production, always set `JWT_SECRET` to a random string of **at least
32 characters** (e.g. generated with a password manager) and set `MONGODB_URI`
to your Atlas connection string. Never commit real values to Git — the
root `.gitignore` already excludes `.env`, `node_modules/`, `dist/` and
`target/`.

## MongoDB setup

**Option A — local MongoDB (simplest for development)**

1. Install MongoDB Community Server and start it (on Windows, it runs as a
   service by default, listening on `mongodb://localhost:27017`).
2. Nothing else to create: on first register/login, Spring Data MongoDB
   creates the `finance_tracker` database and the `users`, `transactions`
   and `budgets` collections automatically.


## Run it locally (Windows PowerShell)

You need Java 17+, Maven, Node.js 18+ and MongoDB (local or Atlas).
Open **two** PowerShell windows — one for the backend, one for the frontend.

**1. Backend (first window)**

```powershell
cd C:\path\to\PersonalFinanceTracker\server
# Only needed if you use Atlas or want a permanent JWT secret:
$env:MONGODB_URI = "mongodb+srv://<user>:<password>@<cluster>/finance_tracker?retryWrites=true&w=majority"
$env:JWT_SECRET = "a-random-string-at-least-32-characters-long"
mvn spring-boot:run
```

Wait for `Started FinanceTrackerApplication` — the backend is now on
http://localhost:8080. If it exits with a MongoDB connection error, MongoDB
is not reachable: check that local MongoDB is running, or that your
`MONGODB_URI` and Atlas IP allow-list are correct.

**2. Frontend (second window)**

```powershell
cd C:\path\to\PersonalFinanceTracker\client
npm install
npm run dev
```

Open http://localhost:5173, register an account, and start adding
transactions. The Vite dev server proxies `/api` to the backend, so no extra
configuration is needed. (`npm run build` produces a production build in
`client/dist/`.)

## Tests performed

- ✅ Frontend: `npm install` + `npm run build` — builds clean (one harmless
  Vite warning that the Recharts bundle chunk is over 500 kB; it is not an
  error and needs no fix).
- ✅ Backend: all 25 Java files compile with `javac` against the Spring Boot
  3.2.5 / MongoDB / JJWT dependencies — zero errors.
- ✅ JWT: a standalone run of the real `JwtUtil` class confirmed a token
  generates and returns the correct user id, a tampered token is rejected,
  and the no-secret fallback still issues a working token.
- ✅ Checked by hand: no TODOs, no placeholder/sample data, no hardcoded
  secrets, and every frontend field matches the backend JSON field names
  (dashboard totals/charts, budget response, transaction fields).
