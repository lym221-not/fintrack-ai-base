# FinTrack AI - Project Overview

FinTrack AI is a modern, responsive personal finance tracking application designed to help users manage their income, expenses, and budgets seamlessly. 

## Technology Stack
- **Frontend Framework**: React 18 with TypeScript & Vite
- **Routing**: React Router DOM v6
- **Backend & Authentication**: Supabase
- **State Management & Data Fetching**: TanStack Query v5 (React Query)
- **Form Handling & Validation**: React Hook Form + Zod
- **Styling & UI Components**: Tailwind CSS, shadcn/ui
- **Data Visualization**: Recharts

---

## Recent Improvements

The application recently underwent a massive functional overhaul to connect the user interface to a real database, transforming it from a static UI into a fully-functional web application. The improvements were implemented in four distinct phases:

### Phase 1: Core Functionality (Forms & Mutations)
*Replaced placeholder interactions with real database mutations.*
- **Transaction Management**: Fully wired the "Add", "Edit", and "Delete" transaction buttons to Supabase.
- **Form Validation**: Migrated all forms to use `react-hook-form` paired with `zod` for robust, type-safe client-side validation.
- **Budgeting**: Created a new `budgets` table and implemented a `useUpsertBudget` hook to allow users to save and update monthly category limits.
- **Account Settings**: Activated the Settings page, allowing users to update their profile (`display_name`) and securely log out of the application.

### Phase 2: Dashboard & Analytics
*Replaced hardcoded data with real-time aggregates and charts.*
- **Live Dashboard Stats**: The dashboard now calculates and displays real "Current Balance", "Total Income", and "Total Expenses" based on the user's fetched transactions for the current month.
- **Dynamic Budget Progress**: The dashboard dynamically cross-references the user's `budgets` with their actual `transactions` to render accurate, color-coded progress bars (Green, Yellow for >80%, Red for over-budget).
- **Interactive Reports**: Upgraded the `Reports.tsx` page to utilize `Recharts`, rendering a dynamic Pie Chart (Expenses by Category) and Bar Chart (Spending Breakdown) that reacts to a Month/Year selector.
- **Search & Filters**: Added functional, real-time filtering to the Transactions page, allowing users to search by description or filter by "Income/Expense" and specific categories.

### Phase 3: Polish & UX Features
*Added quality-of-life enhancements for a premium feel.*
- **Export to CSV**: Added a utility allowing users to download their filtered transaction list as a native `.csv` file.
- **Dark Mode**: Integrated a global dark mode toggle directly into the sidebar navigation. Preferences are saved to `localStorage` and persist across sessions.
- **Recurring Transactions**: Updated the database schema and UI to support an optional `recurrence` marker (None, Weekly, Monthly, Yearly).
- **Proactive Alerts**: Implemented dynamic toast notifications that pop up on the dashboard to warn users immediately when they are approaching (80%) or exceeding (100%) a specific category budget limit.
- **Telegram Bot Integration**: Added functionality to the Settings page to generate a secure, 6-character link code for the Telegram bot. This code is saved directly into the `telegram_link_codes` Supabase table with an automatic 15-minute `expires_at` expiration limit. The end-to-end flow is fully verified and working: generate code in the web app → send to the skills server bot → account is linked.

### Phase 4: Budgets & Planning
*Expanded the budgeting system into a fully-featured planning interface.*
- **Dedicated Budgets Page**: Added a new `/budgets` route and sidebar entry. This page acts as a comprehensive planning hub, displaying all user categories, their budget limits, and actual spent amounts.
- **Month Navigator**: Introduced a dynamic month navigator to browse and plan budgets for any past or future month (up to 12 months ahead). Past months are protected by a read-only state with an informational banner, ensuring historical records aren't accidentally modified.
- **Total Budget Summary Blocks**: Integrated an aggregated summary block at the top of both the Budgets page and the Dashboard Budgets card. It displays total limits vs. total spent, remaining amounts, and a master color-coded progress bar.
- **Dashboard Card Upgrades**: Re-engineered the dashboard Budgets card to merge available categories and existing budgets. It now features a summary tracking line (e.g., "X of Y categories on track" with a colored dot), supports an empty state with a PiggyBank icon, and allows inline budget setting and editing directly from the dashboard view.

---

## Manual Database Requirements
To support these features, the Supabase backend utilizes the following custom schema additions:
1. A `budgets` table with a unique constraint on `(user_id, category_id, month, year)`.
2. A `recurrence` column (text) on the existing `transactions` table.
3. Row Level Security (RLS) policies to ensure users can only read/write their own data.
4. A `telegram_link_codes` table with an auto-calculating `expires_at` default value (`now() + interval '15 minutes'`) and policies allowing anonymous bot access for validation.
