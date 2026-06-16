# stackCount.io

**Full-stack finance app with OpenAI GPT integration — portfolio project by Kiril Sierykov.**

stackCount tracks income, expenses, and profit across multiple companies, and uses the **OpenAI GPT API** to generate automated financial insights from transaction data. Built to demonstrate full-stack development skills: Next.js, PostgreSQL, authentication, payments, and production AI API integration.

---

## Highlights

- **OpenAI GPT API** — Analyze feature sends 90 days of transactions to `gpt-4o-mini` and returns structured financial insights (my first production AI API integration)
- **Full-stack Next.js 15** — App Router, server components, API routes, middleware
- **Auth** — NextAuth.js with Google OAuth and email/password (bcrypt + Prisma)
- **Database** — Neon PostgreSQL with Prisma ORM
- **Payments** — Stripe donations
- **Deployed** — Vercel production with environment-based configuration

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS v4, shadcn/ui |
| Backend | Next.js App Router API routes |
| Database | Neon PostgreSQL + Prisma |
| Auth | NextAuth.js (Google OAuth + credentials) |
| AI | OpenAI GPT API (`gpt-4o-mini`) |
| Payments | Stripe |
| Hosting | Vercel |

---

## Project Structure

```
app/        # App Router pages & API routes
components/ # UI components
lib/        # Auth, Prisma, analysis helpers
prisma/     # Database schema
public/     # Static assets
```

---

## Local Setup

```bash
git clone https://github.com/seggieval/stackcount.io.git
cd stackcount.io
pnpm install
```

Create a `.env` file with at minimum:

```env
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
OPENAI_API_KEY=
```

Run the dev server:

```bash
pnpm dev:clean
```

Open [http://localhost:3000](http://localhost:3000).

---

## Author

**Kiril Sierykov** — [sierykov.com](https://sierykov.com)

Built as a portfolio project to demonstrate full-stack development and OpenAI GPT API integration.
