# GoldTrust — Savings & Micro-Loan Platform

A modern rebuild of the Golden Trust / TGRLFUNDS microfinance app: five desks
(Client, Field Staff, Front Desk, ICT, Admin) sharing one live ledger of
savings, loans and payments. Backend and frontend now live in a single
project folder.

```
goldtrust/
├── server/     Express + MongoDB API
└── client/     React + Vite + Tailwind SPA
```

## What it does

- **Clients** save daily, weekly or monthly, request loans (scored against
  their savings history), track repayment schedules, and request withdrawals.
- **Field staff** onboard clients, collect cash/card payments, and give a
  first-pass recommendation on loan requests.
- **Front desk** searches client records, logs complaints and call outcomes,
  and tracks loans awaiting disbursement.
- **ICT** manages staff accounts, device/SIM inventory, and resolves
  escalated complaints.
- **Admin** sees portfolio-wide KPIs, gives the final approve/reject decision
  on loans (or creates one manually), and reviews withdrawal requests.

## Getting started

**Requirements:** Node 18+, a MongoDB connection string (local or [Atlas](https://www.mongodb.com/atlas)).

```bash
# 1. install dependencies for both server and client
npm run install-all

# 2. configure the API
cp server/.env.example server/.env
# then edit server/.env and set MONGO_URI and JWT_SECRET

# 3. (optional) seed demo accounts — see server/utils/seed.js for the logins
npm run seed

# 4. run both the API (port 5000) and the app (port 5173) together
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the
Express server, so no CORS setup is needed locally.

### Demo logins (after `npm run seed`, all passwords `password123`)

| Desk | Identifier |
|---|---|
| Admin | admin@goldtrust.com |
| Staff | staff@goldtrust.com |
| Front desk | frontdesk@goldtrust.com |
| ICT | ict@goldtrust.com |
| Client | client@goldtrust.com or 08030000003 |

## Production build

```bash
npm run build   # builds client/dist
npm start       # serves the built SPA from the Express server on $PORT
```

## Notes

- Loan interest is a flat 8%/month, repaid weekly over 3–6 months; credit
  score is derived from savings balance and account age.
- Every business action (loan decisions, withdrawal approvals, payment
  collection) is enforced server-side by role via JWT — the frontend routes
  are just a convenience layer.
