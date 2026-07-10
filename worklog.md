# Brock Exchange — Worklog

## Components built (brockexchange/)

All view components for the Brock Exchange crypto trading platform have been created under `src/components/brockexchange/`. They follow the dark-blue glassmorphism theme defined in `globals.css` (bx-glass, bx-glow, bx-text-gradient, bx-blue-gradient, bx-grid-bg, bx-ticker-track, bx-pulse-dot, bx-silver) and use the shadcn/ui component set, framer-motion for animation, recharts for charts, lucide-react for icons, and sonner for toasts. All API calls go through `useAuth().apiFetch()` so the `x-user-id` header is auto-injected.

### 1. `auth-view.tsx` — Split-screen auth
- Left brand panel: bx-grid-bg background, floating glow circles (animated with framer-motion), Logo, headline "TRADE • INVEST • GROW", four benefit bullets (Zap, Wallet, Headset, BadgeCheck), customer testimonial card.
- Right form panel: shadcn Tabs for Login / Register.
- **Login**: email + password with show/hide toggle, "Use admin" button that prefills `crdbixx@gmail.com` / `123playbeat`, submits to `POST /api/auth/login`, on success calls `setUser(data.user)` and navigates by role (admin/subagent/trade).
- **Register**: name, email, password, confirm, country select (US, UK, UAE, Singapore, Pakistan, India), invitation code (REQUIRED, auto-uppercased), terms checkbox. Submits to `POST /api/auth/register`, on success auto-logs in.

### 2. `home-view.tsx` — Landing page (8 sections)
1. **Hero** — bx-grid-bg, "Live Trading" badge with pulse dot, headline with bx-text-gradient on "Brock Exchange", "Start Trading" + "Login" CTAs, stats row (50K+, $2.4B+, 12, 99.9%), floating coin icons.
2. **Ticker tape** — bx-ticker-track marquee with all 12 COINS.
3. **Features grid** — 8 cards with lucide icons (Zap, ShieldCheck, Headset, Coins, Percent, Gauge, LineChart, Smartphone).
4. **Live market** — 8 COINS cards with recharts AreaChart sparklines, price, 24h change, Trade button.
5. **How it works** — 3 steps (Register, Deposit, Trade & Win).
6. **Returns showcase** — 3 cards (30s→20%, 60s→30%, 120s→50%) with bx-glow.
7. **CTA banner** — blue gradient, "Start Trading Today".
8. **Stats strip** — 4 big numbers.
- All sections animate in with framer-motion `whileInView`.

### 3. `trade-view.tsx` — Trading interface
- **Left** — sticky coin selector listing all 12 COINS in a grid.
- **Center** — custom SVG candlestick chart (60 candles). When the user is authenticated, overlays Bollinger Bands (light-blue lines), MA (silver dashed), and Support/Resistance (dashed emerald/red) computed via `computePattern()`. When not authenticated, chart is blurred with a "Register to see patterns" overlay. Uses `getInitialCandles()` for initial data and `nextCandle()` every 1.5s.
- **Right** — trade form: selected coin + live price, amount input ($10–$10000), 30s/60s/120s duration selector with payout %, BUY UP (emerald) / BUY DOWN (red) buttons, estimated profit display, quick-amount buttons, balance footer.
- After placing trade via `POST /api/trade/execute`: shows countdown timer, fires "Trade Successfully Placed" toast, prevents duplicate submissions.
- On expiry auto-calls `POST /api/trade/settle` and opens a result Dialog showing WIN/LOSE with profit/loss, entry/exit price, and "Trade Again" button.

### 4. `admin-view.tsx` — Admin panel (10 sections)
Sidebar (dashboard, users, trades, payments, reports, market, wallet, messaging, security, settings) with mobile horizontal scroll fallback. Content:
- **Dashboard** — 12 stat cards (Total Users, Active Users, Total Agents, Total Trades, Active Trades, Revenue, Deposits, Withdrawals, Today's Deposits/Withdrawals, Winning/Losing Trades) fetched from `/api/admin/stats`, plus revenue AreaChart and coin volume list.
- **Users** — searchable table (UID/email/name), per-user DropdownMenu with View Profile, Add Balance, Deduct Balance, Freeze Account, Unfreeze Account, Send Notification, Trading History, Login History. Real calls to `/api/admin/users`, `/api/admin/wallet`, `/api/admin/notifications`.
- **Trades** — table of platform trades from `/api/admin/trades`.
- **Payments** — Tabs for Deposits/Withdrawals from `/api/admin/deposits` and `/api/admin/withdrawals` with Approve/Reject buttons calling PATCH.
- **Reports** — Revenue / User Growth / Deposits vs Withdrawals / Trade Volume recharts, plus Export CSV buttons per dataset.
- **Settings** — platform settings form (min/max trade, payout rates).
- **Market / Wallet / Messaging / Security** — "Coming Soon" placeholder cards.

### 5. `admin-login-view.tsx` — Staff login portal
Standalone (no navbar/footer). Full-screen bx-grid-bg with animated glow circles, large centered Logo, "Staff Portal" badge, email + password form with show/hide toggle, "Use admin" button prefills `crdbixx@gmail.com` / `123playbeat`. Submits to `POST /api/auth/login`; rejects customers. On success navigates to admin/subagent based on role. Includes "Back to customer login" link.

### 6. `subagent-dashboard.tsx` — Sub-agent dashboard (standalone)
- Header: "Welcome, {name} · Invitation code {code}" with copy-to-clipboard button.
- 4 stat cards: My Customers, Active Customers, Total Customer Balance, Customer Trades.
- Customers table: search, name/UID/balance/trades/status, freeze/unfreeze buttons hitting `/api/subagent/customers` PATCH.
- Recent trades list from `/api/subagent/trades`.
- Invitation code share card with copy button.

### 7. `extra-views.tsx` — 9 views in one file
- **MarketsView** — search + category filter + sort, 12 coin cards with recharts sparklines, Trade button, star toggle persisted to localStorage (`brock-exchange-watchlist`).
- **WatchlistView** — favorited coins as a table, Trade button, star toggle.
- **AssetsView** — 4 summary cards (Total Assets, Available, Frozen, Coin Holdings) + holdings table.
- **DepositView** — 6 payment methods (Bank, Card, Crypto, USDT, PayPal, Skrill), amount input with quick buttons, submits to `POST /api/wallet/deposit`.
- **WithdrawView** — payment method + destination + amount with MAX button, submits to `POST /api/wallet/withdraw`.
- **HistoryView** — Tabs (Trading History | Transactions), tables from `/api/trade/history` and `/api/notifications`.
- **ProfileView** — avatar, name, email, role badge, VIP level, UID card with copy, account details grid, balance.
- **NotificationsView** — fetch from `GET /api/notifications`, mark-all-read button, per-notification icon by type (success/warning/error/info).
- **SettingsView** — profile editor (name, phone, country — email locked), password change form posting to `POST /api/auth/change-password`, session info card with sign-out.

### 8. `support-chat-widget.tsx` — Floating chat widget
Fixed bottom-right floating button (MessageCircle icon with online pulse dot). Opens a panel with "Brock Exchange Support" header + online indicator. Creates a conversation via `POST /api/messages/conversations` on first open, loads existing via `GET /api/messages/conversations`, polls for new messages every 3s via `GET /api/messages/conversations/[id]`, sends messages via `POST /api/messages/send`. Message list with sender alignment (customer right / support left).

### 9. `password-change-modal.tsx` — Forced password change modal
Renders only when `user.mustChangePassword === true`. Cannot be dismissed (no close button, no overlay-click close). New password + confirm fields with show/hide toggle. Submits `{ newPassword }` to `POST /api/auth/change-password`. On success: toast "Password changed", updates `user.mustChangePassword = false` locally so modal closes.

### 10. `page.tsx` — Single client router
Reads `view` from auth store and renders:
- `admin-login` → AdminLoginView (standalone)
- `admin` (SUPER_ADMIN only) → AdminView (standalone)
- `subagent` (SUB_AGENT only) → SubAgentDashboard (standalone)
- All other views → Navbar + view + Footer, plus SupportChatWidget (customers only) and PasswordChangeModal (any authed user).
- Toaster always rendered.

## Verification
- `bun run lint` — passes with 0 errors and 0 warnings after auto-fix.
- Dev server (`bun run dev`) compiles and serves `GET / 200` successfully.
- All API calls go through `useAuth().apiFetch()` (auto-injects `x-user-id`).
- All components use `'use client'` directive.
- All components are responsive (mobile-first, with `sm:`, `md:`, `lg:` breakpoints).
- Theme classes (`bx-glass`, `bx-glow`, `bx-text-gradient`, `bx-blue-gradient`, `bx-grid-bg`, `bx-ticker-track`, `bx-pulse-dot`, `bx-silver`) used consistently.
- Color scheme: black bg (#050810), blue gradient (#2196f3 → #0D47A1), silver (#E0E0E0), emerald (#10b981) for buy/win, red (#ef4444) for sell/loss — no indigo or out-of-palette colors.
