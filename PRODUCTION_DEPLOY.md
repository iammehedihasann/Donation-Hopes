# প্রোডাকশন ডিপ্লয় গাইড (Vercel + Render + Atlas)

আমি আপনার অ্যাকাউন্টে লগইন করে লাইভ URL তৈরি করতে পারি না। নিচের ধাপগুলো অনুসরণ করলে আপনি **লাইভ ফ্রন্ট** ও **লাইভ API** পাবেন।

## ১. MongoDB Atlas

1. ক্লাস্টার → **Network Access** → `0.0.0.0/0` (বা শুধু Render/Railway আউটবাউন্ড IP যদি জানেন)।
2. **Database Access** → ইউজার + শক্ত পাসওয়ার্ড।
3. **Connect** → অ্যাপ্লিকেশন স্ট্রিং কপি করুন → এটাই `MONGODB_URI`।

## ২. ব্যাকএন্ড — Render (সুপারিশ)

কেন Render: রুটে `render.yaml` আছে, `/api/health` হেলথ চেক, ফ্রি টিয়ারে সরাসরি Node + `npm start`।

1. [render.com](https://render.com) → **New** → **Blueprint** → রিপোজিটরি কানেক্ট।
2. এনভ ভেরিয়েবল সেট করুন (ড্যাশবোর্ডে):
   - `MONGODB_URI`
   - `JWT_SECRET` (৩২+ র্যান্ডম বাইট, `openssl rand -base64 48`)
   - `CORS_ORIGINS` — **শুধু** আপনার Vercel URL, যেমন `https://your-app.vercel.app` (প্রিভিউ URL আলাদা হলে কমা দিয়ে একাধিক)
   - `NODE_ENV=production`
   - (ঐচ্ছিক) `SEED_ADMIN_*` প্রথম চালুর জন্য
3. ডিপ্লয় শেষে পাবেন: `https://hopes-api-xxxx.onrender.com`  
   → **API বেস** = সেই URL (শেষে `/` নয়)।

**Railway বিকল্প:** নতুন প্রজেক্ট → **Deploy from GitHub** → সার্ভিসের **Root Directory** `backend` → একই এনভ। `backend/railway.toml` রেফারেন্স।

## ৩. ফ্রন্টএন্ড — Vercel

1. [vercel.com](https://vercel.com) → ইমপোর্ট রিপো।
2. **Root Directory:** `frontend`
3. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = `https://hopes-api-xxxx.onrender.com` (আপনার ব্যাকএন্ড URL)
4. ডিপ্লয় → **লাইভ ফ্রন্ট** = `https://....vercel.app`

## ৪. যাচাই

- ব্রাউজারে: `https://আপনার-api.onrender.com/api/health` → JSON `success: true`
- Vercel সাইট খুলে লগইন/ক্যাম্পেইন লোড — ডেভটুলস **Network** এ CORS এরর নেই কিনা দেখুন।
- Atlas **Metrics** এ কানেকশন দেখা যায়।

## ৫. সিকিউরিটি চেকলিস্ট

- [ ] `JWT_SECRET` কখনো গিটে কমিট করবেন না।
- [ ] `CORS_ORIGINS` এ শুধু আপনার ফ্রন্ট ডোমেইন।
- [ ] প্রোডাকশনে `MOCK_OTP_ALWAYS_OK` বন্ধ।
- [ ] ফ্রি Render ডিস্কে `uploads/` স্থায়ী নয় — গুরুত্বপূর্ণ হলে পরে অবজেক্ট স্টোরেজ যোগ করুন।

## ৬. Docker (লোকাল / VPS)

```bash
# রিপো রুটে, .env তৈরি করে MONGODB_URI, JWT_SECRET, CORS_ORIGINS দিন
docker compose up --build
```

## ৭. CI

`.github/workflows/ci.yml` — প্রতি push/PR এ `backend` + `frontend` বিল্ড ও লিন্ট চলে।  
অটো ডিপ্লয় সাধারণত **Vercel / Render “Connect GitHub”** দিয়ে সহজ; ওয়ার্কফ্লোতে সিক্রেট দিয়ে ডিপ্লয়ের উদাহরণ কমেন্টে আছে।

---

### ফাইনাল আউটপুট (আপনি ডিপ্লয়ের পর পূরণ করুন)

| আইটেম | মান |
|--------|-----|
| লাইভ ফ্রন্ট (Vercel) | `https://....vercel.app` |
| লাইভ API (Render) | `https://....onrender.com` |
| MongoDB | Atlas কানেকশন লগ / মেট্রিক্সে সবুজ |

কোডে যোগ হয়েছে: **structured JSON লগ**, **গ্লোবাল + অথ রেট লিমিট**, **প্রোডাকশনে বাধ্যতামূলক `CORS_ORIGINS`**, **`0.0.0.0` বাইন্ড**, **Dockerfile**, **docker-compose**, **render.yaml**, **Railway toml**, **GitHub Actions CI**।
