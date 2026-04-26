# FinTrack AI — Supabase Database Overview

## Project Info
| Field | Value |
|---|---|
| Platform | Supabase (PostgreSQL + Auth + Realtime) |
| Default Currency | THB |
| Default Timezone | UTC |
| Auth Method | Email/Password (web) + Telegram one-time code (bot) |
| RLS | Enabled on all tables |

---

## Tables (5)

### 1. `users`
Extends Supabase's built-in `auth.users`. Created automatically via trigger on signup.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key — mirrors `auth.users.id` |
| `email` | text | User's email |
| `telegram_id` | text | Unique — set after Telegram linking |
| `timezone` | text | Default: `UTC` |
| `currency` | text | Default: `THB` |
| `created_at` | timestamptz | Auto-set |

**RLS Policies:**
- `select` — own row only
- `update` — own row only

---

### 2. `categories`
User-defined spending labels (e.g. Food, Rent, Travel).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK → `users.id` |
| `name` | text | e.g. "Food", "Rent" |
| `color` | text | Hex color, default `#6366f1` |
| `icon` | text | Emoji, default `💰` |
| `created_at` | timestamptz | Auto-set |

**Constraints:** `unique(user_id, name)` — no duplicate category names per user

**RLS Policies:** select, insert, update, delete — own rows only

---

### 3. `transactions`
Core table — every income or expense record.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK → `users.id` |
| `amount` | numeric(12,2) | Must be > 0 |
| `type` | text | Either `income` or `expense` |
| `category_id` | uuid | FK → `categories.id` (nullable, set null on delete) |
| `description` | text | Optional note |
| `date` | date | Default: today |
| `created_at` | timestamptz | Auto-set |

**RLS Policies:** select, insert, update, delete — own rows only

---

### 4. `budgets`
Monthly spending limits per category.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK → `users.id` |
| `category_id` | uuid | FK → `categories.id` |
| `limit_amount` | numeric(12,2) | Must be > 0 |
| `month` | smallint | 1–12 |
| `year` | smallint | ≥ 2000 |
| `created_at` | timestamptz | Auto-set |

**Constraints:** `unique(user_id, category_id, month, year)` — one budget per category per month

**RLS Policies:** select, insert, update, delete — own rows only

---

### 5. `telegram_link_codes`
Temporary one-time codes for linking a Telegram account to a web account.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK → `users.id` |
| `code` | text | Unique (e.g. `LINK-8X92KA`) |
| `expires_at` | timestamptz | Auto-set to now + 15 minutes |
| `used` | boolean | Default: `false` |
| `created_at` | timestamptz | Auto-set |

**RLS Policies:** select, insert — own rows only

---

## Relationships Diagram

```
auth.users
    │
    └──▶ users
              │
              ├──▶ categories ◀──┐
              │                  │
              ├──▶ transactions ──┘ (category_id)
              │
              ├──▶ budgets ──────── (category_id → categories)
              │
              └──▶ telegram_link_codes
```

---

## Auth Flow

### Web App
```
User fills signup form
    → Supabase Auth creates auth.users row
    → Trigger fires → inserts into public.users
    → User is logged in
```

### Telegram Linking
```
User visits Settings → "Connect Telegram"
    → App generates code (e.g. LINK-8X92KA)
    → Code stored in telegram_link_codes (expires in 15 min)
    → User sends code to @FinTrack_liam_bot
    → Bot matches code → updates users.telegram_id
    → All future bot messages resolve to this user
```

---

## Key Triggers & Functions

### `handle_new_user()`
Fires automatically after every new signup. Inserts a matching row into `public.users` using the new auth user's `id` and `email`.

```sql
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## Security Rules Summary
| Rule | Detail |
|---|---|
| RLS enabled | All 5 tables |
| User isolation | Every query filtered by `auth.uid()` |
| No raw SQL | Parameterized Supabase queries only |
| Code expiry | Telegram link codes expire after 15 minutes |
| Service role key | Never exposed to frontend |
