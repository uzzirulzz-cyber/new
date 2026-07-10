---
Task ID: 1
Agent: full-stack-developer
Task: Foundation — Prisma schema (Brock Exchange), DB push, seed, theme, market-data, auth-store, api-auth

Work Log:
- Wiped old BlockExchange.buzz code (components/admin, agent, customer, auth, trading, dashboard; hooks/use-auth; lib/auth, trading-data, dashboard-data; all old API routes) to start fresh.
- Replaced .env DATABASE_URL with Neon PostgreSQL connection string.
- Replaced prisma/schema.prisma with new Brock Exchange schema (provider=postgresql): User (CUSTOMER/SUB_AGENT/SUPER_ADMIN roles, balance, vipLevel, invitationCode/referralCode/linkedSubAgentId for RBAC), Trade (UP/DOWN binary options, 30/60/120s, PENDING/WIN/LOSE), Transaction (DEPOSIT/WITHDRAWAL/TRADE_PROFIT/TRADE_LOSE/ADMIN_CREDIT/ADMIN_DEBIT/FREEZE/UNFREEZE), Notification, LoginLog, ActionLog, Conversation, Message, Agent.
- Reset Neon DB and pushed new schema (db migrate reset --force + db push --accept-data-loss).
- Created prisma/seed.ts with embedded default accounts: SUPER_ADMIN (crdbixx@gmail.com / 123playbeat / BX-SUPERADMIN) + 5 SUB_AGENT accounts (subagent1..5@trade.com / default / PB-AG001..005, all mustChangePassword=true, with Agent profile). Ran seed successfully.
- Rewrote src/app/globals.css with Brock Exchange brand theme: black bg (#02060f) + blue gradient (#2196f3 → #0d47a1) + silver (#e0e0e0), glassmorphism utilities (bx-glass, bx-glass-soft), glow effects (bx-glow, bx-glow-strong, bx-glow-silver), gradient text (bx-text-gradient, bx-text-silver), animated ticker (bx-ticker-track), pulse dot, fade-in, float, custom scrollbar.
- Created src/lib/api-auth.ts: bcrypt-based hashPassword/verifyPassword (10 rounds), getAuthUser (reads x-user-id header), requireRole/requireAdmin, toSafeUser (strips passwordHash), randomUid/randomTradeId/randomTxId generators.
- Created src/lib/market-data.ts: 12 coins (BTC, ETH, BNB, SOL, XRP, ADA, DOGE, AVAX, DOT, LINK, LTC, TRX) with basePrice/icon/color; DURATIONS (30s/20%, 60s/30%, 120s/50%); getInitialCandles, nextCandle, tickCandle, computePattern (Bollinger Bands period=20 ±2σ + MA + support/resistance), formatPrice, getPayoutRate.
- Created src/lib/auth-store.ts: Zustand store with persist middleware (name=brock-exchange-auth, version=2 with migration to drop stale localStorage). Tracks user (AuthUser|null), view (17-view union), hydrated. navigate() gates trade→CUSTOMER, admin→SUPER_ADMIN, subagent→SUB_AGENT, wallet-family→CUSTOMER. Exports apiFetch() that auto-injects x-user-id header.
- Dev server restarted fresh with new .env (killed old BlockExchange.buzz dev process that had cached sqlite URL).

Stage Summary:
- Files created/updated: prisma/schema.prisma, prisma/seed.ts, .env, src/app/globals.css, src/lib/api-auth.ts, src/lib/market-data.ts, src/lib/auth-store.ts.
- Database: Neon PostgreSQL schema pushed + seeded with super admin + 5 sub-agents.
- Theme: black + blue gradient + silver, glassmorphism, neon glow per brand spec.
- Ready for: brand components (logo/navbar/footer) + API routes + view components.
