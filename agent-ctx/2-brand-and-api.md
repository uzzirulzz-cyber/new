---
Task ID: 2
Agent: full-stack-developer
Task: Brand components + all API routes

Work Log:
- Created src/components/brock/logo.tsx: 3D cube SVG with B (blue gradient) on upper-right + E (silver gradient) on lower-right, top face gradient + side faces with edge highlights. Exports Logo, LogoMark, BrandWordmark.
- Created src/components/brock/navbar.tsx: sticky glass navbar with BrandWordmark, public links (Home/Markets/Trade) for guests, customer links (Trade/Wallet/Markets/Assets/History) for authed customers, balance pill, notifications bell, user dropdown with role-aware menu, mobile menu.
- Created src/components/brock/footer.tsx: 5-column footer (brand+social, Platform, Account, Support) with view-state navigation, sticky-bottom mt-auto.
- Created src/lib/api-auth.ts: bcryptjs (10 rounds) hashPassword/verifyPassword, getAuthUser (reads x-user-id header → DB), requireRole/requireAdmin, toSafeUser, randomUid/randomTradeId/randomTxId generators, getClientIp helper.
- Created src/lib/market-data.ts: 12 coins (BTC, ETH, BNB, SOL, XRP, ADA, DOGE, AVAX, DOT, LINK, LTC, TRX) with basePrice/icon/color, DURATIONS (30s→20%, 60s→30%, 120s→50%), getInitialCandles/nextCandle/tickCandle, computePattern (Bollinger Bands period=20 ±2σ + MA + support/resistance), formatPrice, getPayoutRate.
- Created src/lib/auth-store.ts: Zustand store with persist (name=brock-exchange-auth, version=2, migration drops stale localStorage), 17-view union type, navigate() gating (trade→CUSTOMER, admin→SUPER_ADMIN, subagent→SUB_AGENT, wallet-family→CUSTOMER), apiFetch() helper that auto-injects x-user-id header.
- Auth API routes: register (validates invitation code against sub-agent referralCode, creates CUSTOMER linked to sub-agent, bumps agent referral count, sends welcome notification), login (bcrypt verify, logs attempt to LoginLog, updates lastLoginAt), me (reads x-user-id), logout (no-op), change-password (verifies current, sets new, clears mustChangePassword), seed (idempotent — creates super admin + 5 sub-agents if missing).
- Trade API routes: execute (validates symbol/direction/duration/amount/balance, deducts balance atomically, creates ACTIVE trade), settle (50/50 win/lose, computes exitPrice with variance, updates trade to SETTLED with WIN/LOSE, credits balance on win + creates TRADE_PROFIT tx, creates TRADE_LOSE tx on loss), history (last 50 trades).
- Admin API routes (SUPER_ADMIN only): stats (totalUsers/customers/subAgents/trades/balance/deposits/withdrawals/pendingApprovals/revenue + 7-day revenue series + top-5 coin volume), users (all customers+subagents with tradesCount), trades (last 100 with user), wallet (CREDIT/DEBIT/FREEZE_FUNDS/UNFREEZE_FUNDS/FREEZE_ACCOUNT/UNFREEZE_ACCOUNT — all log to ActionLog + Transaction), deposits (list + APPROVE/REJECT — approve credits balance), withdrawals (list + APPROVE/REJECT — reject refunds balance), notifications (send to user), user-search (by uid/email/name/referralCode), users/[id]/logins (login history).
- Sub-Agent API routes (data-isolated): customers (only customers where linkedSubAgentId === agent.id), customers PATCH (FREEZE/UNFREEZE own customer only — RBAC enforced at query level), trades (trades for own customers only).
- Customer API routes: notifications (GET list + PATCH mark read single or all), wallet/deposit (creates PENDING DEPOSIT tx), wallet/withdraw (validates balance, debits immediately, creates PENDING WITHDRAWAL tx — admin can reject to refund).
- Messages API routes (RBAC): conversations GET (customers see own, sub-agents see own+linked, admins see all), conversations POST (customers create with subject+body, auto-assigns linkedSubAgentId), conversations/[id] GET (RBAC check), send POST (RBAC check).
- Market API route: history (returns N candles for symbol via getInitialCandles).

Stage Summary:
- All API routes implemented server-side (no 'use client'), all using db (Prisma), all with RBAC enforced.
- Auth: x-user-id header pattern, bcrypt password hashing.
- Trade execute/settle atomic via $transaction.
- Admin actions log to ActionLog + Transaction.
- Sub-agent data isolation enforced at DB query level (linkedSubAgentId filter).
- Messages RBAC: customer/subAgent/admin tiers.
- Ready for: 17 view components (home, login, register, trade, admin×10, admin-login, subagent, wallet, markets, watchlist, assets, deposit, withdraw, history, profile, notifications, settings, password-change-modal, support-chat-widget) + page.tsx wire-up.
