# FinTrack AI Base - Project Details

## Project Overview
FinTrack AI Base is a modern, full-stack financial tracking application designed to help users manage their personal finances with ease. It provides a clean, intuitive interface for tracking income, expenses, setting budgets, and visualizing financial data through comprehensive reports.

## Core Tech Stack
- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Backend-as-a-Service:** Supabase (Authentication & PostgreSQL Database)
- **State Management & Data Fetching:** TanStack Query (React Query) v5
- **Styling:** Tailwind CSS with shadcn/ui (Radix UI primitives)
- **Form Management:** React Hook Form with Zod validation
- **Routing:** React Router DOM v6
- **Visualizations:** Recharts
- **Icons:** Lucide React
- **Testing:** Vitest (Unit/Integration) and Playwright (E2E)

## Key Features
- **Authentication:** Secure user signup and login powered by Supabase Auth.
- **Dashboard:** At-a-glance overview of financial health, including total balance, recent transactions, and spending summaries.
- **Transaction Tracking:** Detailed management of income and expenses with support for categories, dates, and descriptions.
- **Budgets:** Comprehensive category-specific budget limits to help users stay within their financial goals. Features include total budget summaries, progress bars, inline editing, and a month navigator to browse and plan past/future months.
- **Reporting:** Visual data representation using various chart types to analyze spending patterns and income trends.
- **Responsive Design:** Fully optimized for both desktop and mobile devices using a mobile-first approach.
- **Theme Support:** Modern UI with consistent spacing and typography, including global Dark Mode.

## Project Structure
- `src/components/`: Modular UI components.
    - `ui/`: Reusable shadcn/ui components (buttons, inputs, cards, etc.).
    - `AppLayout.tsx`: The main shell of the application including sidebar and navigation.
    - `AuthGuard.tsx`: Protection for private routes.
- `src/pages/`: Main application views.
    - `Index.tsx`: The primary dashboard with active budget insights.
    - `Transactions.tsx`: List and management of all financial records.
    - `Budgets.tsx`: Dedicated budget tracking and monthly planning interface.
    - `Reports.tsx`: Data visualization and financial analysis.
    - `Settings.tsx`: User preferences and account management.
    - `Login.tsx` & `Signup.tsx`: Authentication flows.
- `src/lib/`: Library configurations.
    - `supabase.ts`: Supabase client initialization.
    - `utils.ts`: Tailwind CSS class merging and other utilities.
- `src/types/`: TypeScript definitions.
    - `finance.ts`: Interfaces for Transactions, Categories, and Budgets.
- `src/hooks/`: Custom React hooks for shared logic (e.g., `useDashboard.ts` fetching transactions and categories).
- `src/test/`: Configuration and examples for the testing suite.

## Getting Started
1. **Install Dependencies:** `npm install`
2. **Environment Setup:** Configure `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. **Run Development Server:** `npm run dev`
4. **Build for Production:** `npm run build`
5. **Run Tests:** `npm run test`
