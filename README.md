# BlockExchange.buzz

**Trade Smarter. Grow Faster.**

A premium, production-grade cryptocurrency trading platform with dark glassmorphism UI, role-based access control (RBAC), real-time trading engine, and full admin panel.

## Features

- **Customer Storefront** — Dashboard with live crypto prices, trade screen (30s/60s/120s with 20%/30%/50% profit), wallet, analytics, transaction history, profile
- **Sub-Agent Console** — Agents see only their own customers (strict RBAC data isolation via invitation codes), referral code management, commission tracking
- **Admin Panel** — Full platform stats, user management (14 admin actions), payment approvals, trade monitoring, system notifications, audit logs
- **Trading Engine** — Place trade → lock funds → countdown → auto-settle → win/loss result → wallet update
- **Authentication** — JWT + bcrypt, forced password change on first login, login session tracking, audit logs
- **17 Cryptocurrencies** — BTC, ETH, BNB, SOL, XRP, DOGE, LTC, TRX, BCH, ADA, AVAX, DOT, LINK, BTG, BTS, SHIB, MATIC

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Prisma ORM + SQLite (easily swappable to PostgreSQL)
- JWT auth (jose) + bcryptjs
- Framer Motion animations
- Recharts data visualization

## Setup

```bash
# 1. Install dependencies
bun install

# 2. Copy env file and fill in credentials
cp .env.example .env
# Edit .env with your Super Admin email/password and agent codes

# 3. Create database + seed default accounts
bun run db:push
bun run db:seed

# 4. Start dev server
bun run dev
```

## Environment Variables

See `.env.example` for all required variables:
- `DATABASE_URL` — SQLite file path or PostgreSQL connection string
- `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` — Super admin credentials
- `AGENT_1_EMAIL` through `AGENT_5_EMAIL` — Sub-agent accounts
- `AGENT_1_CODE` through `AGENT_5_CODE` — Invitation codes (PB-AG001 through PB-AG005)

## Default Accounts

| Role | Setup | First Login |
|------|-------|-------------|
| Super Admin | Set via `.env` | Ready to use |
| Sub-Agent ×5 | Set via `.env` | **Must change password** from default |

Customers register using a sub-agent's invitation code.

## Deployment

### Vercel
1. Push to GitHub
2. Import repo at vercel.com/new
3. Add all env vars from `.env.example`
4. Run `bun run db:push && bun run db:seed` (via Vercel CLI or a build script)

### Database
- SQLite for development (file-based, zero config)
- For production, switch to PostgreSQL by changing `DATABASE_URL` and `provider = "postgresql"` in `prisma/schema.prisma`

## License

© 2026 BlockExchange.buzz. All rights reserved.
