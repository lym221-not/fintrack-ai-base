# FinTrack AI Base - Project Details

## Project Overview
FinTrack AI Base is a modern, full-stack personal finance tracking web application designed to give users complete control over their money. With a clean, responsive UI and intelligent features, users can effortlessly track their income, monitor expenses, set category-specific budgets, and visualize their financial health through dynamic reports. The app also features a cutting-edge **Telegram AI Bot Integration** allowing for seamless, conversational logging of transactions.

## How It Works
The application uses a secure, modern technology stack. The frontend is built with React and styled using Tailwind CSS and shadcn/ui to provide a premium user experience with dark mode support. 

Data is securely managed by Supabase, serving as the backend-as-a-service. It handles user authentication, data storage (PostgreSQL database), and real-time syncing. When a user logs in, their financial data is fetched and seamlessly updated across the Dashboard, Transactions list, Budgets, and Reports.

## What Functions Are Included

### 1. Dashboard & Analytics
- **Financial Overview:** At-a-glance view of total balance, total income, and total expenses.
- **Recent Activity:** Quick summary of the latest transactions.
- **Visual Insights:** Mini-charts tracking spending patterns right from the home screen.

### 2. Transaction Management
- **Full CRUD Capabilities:** Users can add, edit, view, and delete transactions.
- **Categorization:** Assign transactions to predefined or custom categories.
- **Filtering & Search:** Easily sort and find specific transactions.
- **Duplicate Action:** Quickly duplicate a previous transaction for recurring expenses.

### 3. Budgeting System
- **Monthly Planning:** Set specific spending limits for different categories (e.g., Food, Transport, Entertainment).
- **Progress Tracking:** Visual progress bars turn red when you're nearing or exceeding your budget.
- **Historical Budgets:** A month navigator to plan ahead for future months or review past performance.

### 4. Advanced Reporting
- **Data Visualization:** Interactive charts (using Recharts) to analyze spending trends over time.
- **Income vs. Expense Breakdown:** Clear graphical representation of cash flow.

### 5. Customization & Settings
- **User Profile:** Manage display name and email.
- **Preferences:** Switch between currencies (THB, USD, EUR, GBP) and timezones.
- **Theme:** Full dark mode support for better accessibility and aesthetics.

---

## 🤖 Telegram Bot Integration: How It Works
One of the standout features of FinTrack AI Base is the seamless integration with a Telegram Bot (`@FinTrack_liam_bot`) for quick, conversational transaction logging.

### The Workflow:
1. **Generate a Secure Code:** Inside the app's Settings page, the user clicks "Generate Code." The system creates a secure, 6-character alphanumeric code that expires in 15 minutes.
2. **Connect via Telegram:** The user opens Telegram, starts a chat with `@FinTrack_liam_bot`, and sends the generated code.
3. **Database Linking:** The bot validates the code against the Supabase database. If valid, the user's Telegram ID is permanently linked to their FinTrack account. The Settings page updates in real-time to show a "Connected" status with a pulsing green indicator.
4. **Chat to Log:** Once connected, the user can simply text the bot in natural language (e.g., *"I just spent $15 on coffee"* or *"Got paid $2000 for freelance work"*). The AI Bot parses the message, categorizes the transaction, and instantly logs it into the user's database—updating the web dashboard immediately!

---

## What the User Can Do
As a user, you have complete autonomy over your financial tracking experience. You can:
- **Sign up / Log in** securely.
- **Add daily expenses and incomes** directly on the web app.
- **Link your Telegram app** to log expenses on-the-go without opening the browser.
- **Set a monthly budget limit** for "Dining Out" and watch the progress bar fill up as you log transactions.
- **Review monthly reports** to see where your money went, using interactive pie and bar charts.
- **Customize your experience** by setting your preferred local currency.
- **Manage your data** securely, with the option to completely delete your account if desired.

## Core Tech Stack
- **Frontend Framework:** React 18 with TypeScript & Vite
- **Backend-as-a-Service:** Supabase (Auth, PostgreSQL DB, Edge Functions)
- **State Management & Data Fetching:** TanStack Query (React Query) v5
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms & Validation:** React Hook Form + Zod
- **Visualizations:** Recharts
- **Icons:** Lucide React
