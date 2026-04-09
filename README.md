# Hopes — Donation & Savings Platform

Bangla-first, mobile-first donation & savings platform for rural villages in Bangladesh.

## Features

- **Bangla + English** UI (language toggle)
- **Dark / Light** mode (saved in localStorage)
- **Auth**: Email + Phone OTP (mock), JWT + bcrypt
- **Wallet**: deposit request (screenshot), withdraw request (admin approval)
- **Donations**: donate from wallet, campaign progress tracking
- **Admin**: campaign management, payment verification, withdraw approvals, user management (suspend/soft delete)
- **Transparency**: public totals + campaign progress + fund usage
- **Security**: Helmet, CORS allowlist, rate limiting, Zod validation, safe uploads

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS + Zustand
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB Atlas (Mongoose)

## Live URLs

- **Frontend (Vercel)**: `<your-vercel-url>`
- **Backend (Render/Railway)**: `<your-backend-url>`

## Local Setup

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Production Deploy

See:

- `PRODUCTION_DEPLOY.md`
- `SETUP.md`

## Notes

- OTP is **mock** by default. For demo/testing in production you can set:
  - `SHOW_DEV_OTP_IN_RESPONSE=true`
  - `MOCK_OTP_FIXED=123456`
  (Do not use these for real production.)

