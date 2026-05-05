# FinTrack Website Improvements 2

## Goal

Improve FinTrack as a complete personal finance product across the website and Telegram bot.

---

## 1. Website Dashboard Improvements

### Add richer charts
- Category spending pie chart
- Daily spending line chart
- Monthly income vs expense bar chart
- Budget progress chart per category

### Add better dashboard cards
- Current balance
- Monthly income
- Monthly expenses
- Savings rate
- Top spending category
- Budget warning summary

### Add empty states
Show friendly messages when there is no data yet, for example:
- “No transactions yet”
- “Add your first expense”
- “Set your first budget”

---

## 2. Transactions Page Improvements

### Better filters
Add filters for:
- Date range
- Category
- Income / expense type
- Minimum and maximum amount
- Search by description

### Transaction actions
Add or improve:
- Edit transaction
- Delete transaction
- Duplicate transaction
- Export filtered transactions to CSV

### Better transaction display
Show:
- Category icon
- Category color
- Relative date, for example “Today” or “Yesterday”
- Clear income and expense colors

---

## 3. Budget Improvements

### Monthly category budgets
Allow users to set budgets like:
- Food: ฿3,000/month
- Transport: ฿1,000/month
- Entertainment: ฿2,000/month

### Budget progress
Show:
- Green when under 80%
- Yellow when above 80%
- Red when over 100%

### Budget alerts
Trigger alerts when:
- User reaches 80% of budget
- User exceeds budget
- User records a transaction that pushes them over budget

---

## 4. Reports and Insights

### Spending insights
Show simple insights like:
- “You spent 25% more on Food this month”
- “Your biggest expense category is Transport”
- “You saved ฿1,500 more than last month”

### Monthly comparison
Compare:
- Current month vs previous month
- Income vs expenses
- Category changes over time

### Export reports
Allow reports to be exported as:
- CSV
- PDF later
- Screenshot-friendly dashboard view

---

## 5. Settings Page Improvements

### Telegram connection status
Show:
- Connected / Not connected
- Linked Telegram ID
- Last linked date
- Button to disconnect Telegram

### Code generation UX
Improve the Telegram linking flow:
- Show active code clearly
- Show expiration countdown
- Show “copy code” button
- Show “open Telegram bot” button
- Disable generating unnecessary duplicate codes if one is still active

### Account settings
Add:
- Display name
- Currency selector
- Timezone selector
- Dark mode preference
- Logout button

---

## 6. Telegram Bot Improvements

### Natural language parsing
The bot should understand messages like:
- “I spent 99 baht on coffee”
- “coffee 80”
- “paid 1200 rent”
- “got salary 20000”
- “earned 5000 from freelance”

The parser should extract:
- Amount
- Type: income or expense
- Category
- Description

### Auto category detection
Use keyword mapping:

| Keyword | Category |
|---|---|
| coffee, lunch, dinner, food, restaurant | Food |
| taxi, grab, bus, train, fuel | Transport |
| netflix, movie, game | Entertainment |
| rent, electricity, water, internet | Bills |
| medicine, hospital, doctor | Health |
| salary, freelance, bonus | Salary |
| clothes, shoes, mall | Shopping |

### Telegram commands
Add useful commands:
- `/start` — welcome message and account status
- `/help` — list supported commands
- `/link CODE` — link Telegram account
- `/balance` — show current balance
- `/spent_today` — show today’s spending
- `/spent_month` — show this month’s spending
- `/budgets` — show budget progress
- `/unlink` — disconnect Telegram account

### Bot response quality
Make replies short and clear:
- “Recorded ฿99 under Food: coffee”
- “Your current balance is ฿12,400”
- “You are at 82% of your Food budget”

---

## 7. Backend Improvements

### Validate request data
For every backend endpoint:
- Check missing fields
- Check amount is a number
- Check amount is positive
- Check Telegram account is linked
- Return clear errors

### Improve transaction insert logic
Avoid using a non-existent `category` column if the database uses `category_id`.

Recommended long-term approach:
1. Find category by name for the user
2. Get `category_id`
3. Insert transaction with `category_id`

### Better logs
Add logs for:
- Link attempts
- Transaction creation
- Balance checks
- Budget checks
- Supabase errors

### Error messages
Return helpful errors:
- “Telegram account not linked”
- “Invalid amount”
- “Category not found”
- “Code expired”
- “Code already used”

---

## 8. Security Improvements

### Keep keys separated
- Frontend uses Supabase anon key only
- Backend uses Supabase service role key only
- Never expose service role key in frontend

### Telegram linking safety
- Codes expire after 15 minutes
- Codes are one-time use
- Old unused codes should be cleaned up
- Prevent linking one Telegram account to multiple users accidentally

---

## 9. Recommended Priority

### Phase 1 — Most important
1. Fix transaction category handling
2. Add `/balance`
3. Add `/help`
4. Add better Telegram natural language parsing
5. Show Telegram connection status in Settings

### Phase 2 — Product polish
1. Add dashboard charts
2. Add better transaction filters
3. Add budget progress UI
4. Add budget warning alerts

### Phase 3 — Advanced features
1. Daily Telegram summary
2. Weekly spending report
3. AI-style spending insights
4. PDF export
5. Recurring transaction automation

---

## Notes About OpenClaw SKILL.md

The current FinTrack OpenClaw skill already supports:
- Recording expenses
- Recording income
- Getting balance summary
- Checking budget by category
- Linking Telegram account with a 6-character code

To upgrade natural language parsing, improve the SKILL.md instructions with clearer examples and category mapping rules. The backend should still validate everything, because the skill may occasionally parse user messages incorrectly.
