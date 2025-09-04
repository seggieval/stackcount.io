
---

# stackCount.io 💸

Welcome to **stackCount.io** – aka *“my first decent SaaS project that nobody asked for but I built anyway.”*  
This is a fake-serious **AI-accountant-but-not-really** app. Built as a portfolio project by **Kiril Sierykov**, age 18, future billionaire (probably).  

---

## ✨ What It Does
- Lets you log in (Google or email/password, whichever breaks less often)
- Pretends to track your income, expenses, and tax estimates
- Lets you create multiple "companies" (even if you own zero in real life)
- Has a donate button (because why not, Stripe is fun)
- Runs on Vercel, because I’m too lazy to set up servers
- Mobile friendly, so you can cry about your expenses on the go

---

## 🛠️ Tech Stack
- **Frontend:** Next.js 15 + React 19 + Tailwind v4 + shadcn/ui
- **Backend:** Next.js App Router APIs
- **Database:** Neon Postgres (free tier, baby)
- **Auth:** NextAuth.js
- **Payments:** Stripe (donations only, I’m not your accountant)
- **Hosting:** Vercel (one-click deploy flex)

---

## 📂 Project Structure
```

app/        # App Router pages & API routes
components/ # Reusable UI stuff
lib/        # Helpers (auth, prisma, utils)
prisma/     # Schema for Prisma
public/     # Static junk (favicon, images)

````

---

## 🧑‍💻 Local Setup (if you’re into pain)

Clone it:
```bash
git clone https://github.com/yourusername/stackcount.io.git
cd stackcount.io
npm install
````

Set up your `.env` (copy-paste keys like a hacker, but don’t commit them to GitHub unless you enjoy free identity theft):

```env
# Database
DATABASE_URL=
DIRECT_URL=
DATABASE_URL_UNPOOLED=
PGDATABASE=
PGHOST=
PGHOST_UNPOOLED=
PGPASSWORD=
PGUSER=
POSTGRES_DATABASE=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_PRISMA_URL=
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_URL_NO_SSL=
POSTGRES_USER=

# Auth / NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_SECRET=
AUTH_URL=

# APIs
OPENAI_API_KEY=
RESEND_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Vercel / Stack
NEON_PROJECT_ID=
NEXT_PUBLIC_STACK_PROJECT_ID=
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=
STACK_SECRET_SERVER_KEY=
VERCEL_OIDC_TOKEN=
```

Run it:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and pray.

---

## 🤑 Donate

Want to support this masterpiece?
There’s a donate page with **Stripe + CashApp**.
Go ahead, make me rich by \$1.

---

## 📜 License

MIT – do whatever you want, just don’t blame me when IRS comes after you.

---

## 👤 Author

Built by **Kiril Sierykov** (a.k.a the guy skipping college).
Portfolio project only.
If you’re a recruiter: *yes, I’m available for hire and I'm 18 yo.*

