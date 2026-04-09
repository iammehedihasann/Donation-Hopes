# Hopes — সেটআপ ও ডিপ্লয়মেন্ট

দান ও সঞ্চয় প্ল্যাটফর্ম: Next.js (ফ্রন্ট) + Express + MongoDB (ব্যাকএন্ড)।

**প্রোডাকশন ডিপ্লয়ের পূর্ণ ধাপ:** [PRODUCTION_DEPLOY.md](./PRODUCTION_DEPLOY.md)  
**CI:** `.github/workflows/ci.yml` (পush/PR এ বিল্ড + লিন্ট)।

## লোকাল চালানো

### ১. MongoDB

লোকাল MongoDB চালু করুন অথবা Atlas URI ব্যবহার করুন।

### ২. ব্যাকএন্ড

```bash
cd backend
cp .env.example .env
# MONGODB_URI, JWT_SECRET (কমপক্ষে ৩২ অক্ষরের র্যান্ডম), প্রয়োজনে SEED_ADMIN_*
npm install
npm run dev
```

API: `http://localhost:5000` — স্বাস্থ্য পরীক্ষা: `GET /api/health`

প্রথম চালুতে `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PHONE`, `SEED_ADMIN_PASSWORD` সেট থাকলে একটি অ্যাডমিন ইউজার তৈরি হবে। অ্যাডমিনকে নিবন্ধনের সময় দেওয়া ইমেইল দিয়ে লগইন করুন।

### ৩. ফ্রন্টএন্ড

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
```

অ্যাপ: `http://localhost:3000`

### ৪. OTP মক (ডেভেলপমেন্ট)

ডেভ মোডে OTP কনসোলে লগ হয়। `backend/.env` এ `MOCK_OTP_FIXED=123456` দিলে সব সময় একই OTP ব্যবহার করা যায়। `MOCK_OTP_ALWAYS_OK=true` দিলে যেকোনো OTP গ্রহণযোগ্য (শুধু পরীক্ষার জন্য)।

## API সংক্ষেপ

| গ্রুপ | বেস পাথ |
|--------|---------|
| অথ | `/api/auth/*` |
| ইউজার | `/api/users/*` |
| ওয়ালেট | `/api/wallet/*` |
| লেনদেন | `/api/transactions/*` |
| ক্যাম্পেইন | `/api/campaigns/*` |
| দান | `/api/donations/*` |
| পেমেন্ট (জমা) | `/api/payments/*` |
| অ্যাডমিন | `/api/admin/*` |
| স্বচ্ছতা | `/api/transparency` |

## টেস্ট চেকলিস্ট (ম্যানুয়াল)

- নিবন্ধন → ওয়ালেট ব্যালেন্স ০
- ইমেইল লগইন / ফোন OTP লগইন
- জমা: স্ক্রিনশট সহ ফর্ম → অ্যাডমিন যাচাই → ব্যালেন্স বৃদ্ধি
- দান: ক্যাম্পেইন → ব্যালেন্স ও `collectedAmount` আপডেট
- উত্তোলন অনুরোধ → অ্যাডমিন অনুমোদন/প্রত্যাখ্যান → ব্যালেন্স সঠিকতা
- স্বচ্ছতা পেজে মোট দান ও খরচের রেকর্ড

## ডিপ্লয়মেন্ট

### বিনামূল্যে পাবলিক ডিপ্লয় (মাথায় রাখবেন)

একটি **সহজ ফ্রি স্ট্যাক**: **MongoDB Atlas (M0 ফ্রি)** + **Render (ব্যাকএন্ড, ফ্রি ওয়েব সার্ভিস)** + **Vercel (ফ্রন্ট, ফ্রি)**।

**অর্ডার (গুরুত্বপূর্ণ):** আগে Atlas → তারপর ব্যাকএন্ড (Render) → শেষে ফ্রন্ট (Vercel)। ফ্রন্টের `NEXT_PUBLIC_API_URL` হবে Render-এর `https://....onrender.com` URL।

| স্তর | সেবা | মনে রাখবেন |
|------|------|------------|
| ডাটাবেস | [MongoDB Atlas](https://www.mongodb.com/atlas) ফ্রি ক্লাস্টার | নেটওয়ার্ক অ্যাক্সেসে `0.0.0.0/0` (সব IP) বা Render-এর আউটবাউন্ড IP ডকুমেন্টেশন অনুযায়ী সীমিত করুন |
| API | [Render](https://render.com) → Web Service, রুট `backend` | ফ্রি প্ল্যানে স্লিপ হয়; প্রথম রিকোয়েস্টে ৩০–৬০ সেকেন্ড ঠান্ডা স্টার্ট হতে পারে |
| UI | [Vercel](https://vercel.com) → প্রজেক্ট রুট `frontend` | বিল্ড এনভ: `NEXT_PUBLIC_API_URL` |

**ব্যাকএন্ড (Render) এনভায়রনমেন্ট উদাহরণ:**

- `MONGODB_URI` — Atlas কানেকশন স্ট্রিং  
- `JWT_SECRET` — দীর্ঘ র্যান্ডম স্ট্রিং (কমপক্ষে ৩২ অক্ষর)  
- `NODE_ENV=production`  
- `PORT` — Render সাধারণত `10000` দেয়; কোডে `process.env.PORT` ব্যবহার আছে  
- `CORS_ORIGINS` — **ঠিক** আপনার Vercel URL, যেমন `https://hopes-xxx.vercel.app` (কমা দিয়ে একাধিক)  
- `SEED_ADMIN_*` — প্রথম ডিপ্লয়ে অ্যাডমিন তৈরি করতে (পরে সরিয়ে ফেলা ভালো)

**ফ্রন্ট (Vercel) এনভ:**

- `NEXT_PUBLIC_API_URL=https://আপনার-সেবা.onrender.com` (শেষে `/` নয়)

**স্ক্রিনশট আপলোড (মাথায় রাখবেন):** Render ফ্রি ডিস্ক **স্থায়ী নয়** — রিস্টার্ট/রিডিপ্লয়ে `uploads/` মুছে যেতে পারে। ডেমো/টেস্ট চলবে; গুরুত্বপূর্ণ প্রোডাকশনের জন্য পরে **Cloudinary / S3 / R2** এ ছবি তুলে নিন।

**OTP:** প্রোডাকশনে `MOCK_OTP_ALWAYS_OK=true` ব্যবহার করবেন না; রিয়েল SMS যোগ করতে হবে।

---

### ফ্রন্টএন্ড — Vercel

1. রিপোজিটরি কানেক্ট করুন; রুট ডিরেক্টরি `frontend` নির্বাচন করুন।
2. এনভায়রনমেন্ট ভেরিয়েবল: `NEXT_PUBLIC_API_URL=https://আপনার-API-ডোমেইন`
3. বিল্ড কমান্ড ডিফল্ট (`next build`) রাখুন।

### ব্যাকএন্ড — Render / VPS

1. Node 20+ ব্যবহার করুন।
2. এনভায়রনমেন্ট: `MONGODB_URI`, `JWT_SECRET`, `PORT`, `CORS_ORIGINS` (Vercel ফ্রন্ট URL সহ)।
3. বিল্ড: `npm install && npm run build` — স্টার্ট: `npm start`।
4. আপলোড ফোল্ডার (`uploads/`) পার্সিস্টেন্ট ডিস্কে মাউন্ট করুন অথবা পরে S3-এ স্থানান্তর করুন।

প্রোডাকশনে `helmet`, CORS মূল সীমিত রাখুন, `JWT_SECRET` শক্ত রাখুন, এবং `MOCK_OTP_ALWAYS_OK` ব্যবহার করবেন না।
