# FinTrack AI — Improvement Instructions for Gemini

This document contains detailed, step-by-step instructions for every improvement needed in the FinTrack AI project. The stack is **React 18 + TypeScript, Vite, Supabase, TanStack Query v5, Tailwind CSS, shadcn/ui, React Hook Form + Zod, React Router DOM v6, Recharts**.

---

## PHASE 1 — Fix Non-Functional Buttons (Critical)

---

### 1.1 — Add Transaction Button

**File to edit:** `src/pages/Transactions.tsx`

**What to do:**
- There is a button (likely labeled "Add Transaction" or "+") that opens a modal or form but does not save any data.
- Wire it up fully using React Hook Form + Zod validation + Supabase insert + React Query mutation.

**Step-by-step:**

1. Define a Zod schema for the transaction form:
```ts
import { z } from 'zod';

const transactionSchema = z.object({
  amount: z.number({ invalid_type_error: 'Amount is required' }).positive(),
  description: z.string().min(1, 'Description is required'),
  category_id: z.string().uuid('Select a category'),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'Date is required'),
});

type TransactionForm = z.infer<typeof transactionSchema>;
```

2. Create a `useAddTransaction` mutation hook in `src/hooks/useTransactions.ts`:
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TransactionForm) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('transactions').insert({
        ...data,
        user_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
```

3. In the form component, use `useForm` with the schema and call the mutation on submit:
```ts
const { register, handleSubmit, formState: { errors }, reset } = useForm<TransactionForm>({
  resolver: zodResolver(transactionSchema),
});

const addTransaction = useAddTransaction();

const onSubmit = async (data: TransactionForm) => {
  await addTransaction.mutateAsync(data);
  reset();
  // close the modal/dialog
};
```

4. Make sure the submit button triggers `handleSubmit(onSubmit)` and shows a loading state:
```tsx
<Button type="submit" disabled={addTransaction.isPending}>
  {addTransaction.isPending ? 'Saving...' : 'Add Transaction'}
</Button>
```

---

### 1.2 — Edit Transaction Button

**File to edit:** `src/pages/Transactions.tsx`

**What to do:**
- Each transaction row has an Edit button that either does nothing or doesn't save changes.
- Wire it to a Supabase update call.

**Step-by-step:**

1. Create an `useUpdateTransaction` mutation hook:
```ts
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TransactionForm> }) => {
      const { error } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
```

2. Pre-fill the edit form with the existing transaction data using `useForm`'s `defaultValues`.
3. On submit, call `updateTransaction.mutateAsync({ id: transaction.id, data })`.

---

### 1.3 — Delete Transaction Button

**File to edit:** `src/pages/Transactions.tsx`

**What to do:**
- The delete button (trash icon) does not remove the transaction from the database.

**Step-by-step:**

1. Create a `useDeleteTransaction` mutation:
```ts
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
```

2. Add a confirmation dialog (use shadcn/ui `AlertDialog`) before deleting.
3. Call `deleteTransaction.mutate(transaction.id)` when confirmed.

---

### 1.4 — Budget Save Button

**File to edit:** `src/pages/` (wherever the budget form lives, likely a Budget or Settings page)

**What to do:**
- The "Set Budget" or "Save Budget" button does not persist anything to the database.

**Step-by-step:**

1. Create a `budgets` table in Supabase if it doesn't exist:
```sql
create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  category_id uuid references categories(id),
  amount numeric not null,
  month text not null, -- format: 'YYYY-MM'
  created_at timestamptz default now()
);
```

2. Create a `useUpsertBudget` mutation hook:
```ts
export function useUpsertBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { category_id: string; amount: number; month: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('budgets').upsert({
        ...data,
        user_id: user?.id,
      }, { onConflict: 'user_id,category_id,month' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
```

3. Wire the budget form's submit button to this mutation.

---

### 1.5 — Settings Page Actions

**File to edit:** `src/pages/Settings.tsx`

**What to do:**
- "Save" button for profile/preferences does nothing.
- "Logout" button may not work.

**Step-by-step for Logout:**
```ts
const handleLogout = async () => {
  await supabase.auth.signOut();
  navigate('/login'); // React Router
};
```

**Step-by-step for Save Profile:**
```ts
const { error } = await supabase.auth.updateUser({
  data: { display_name: formData.name },
});
```

- Show a success toast using the existing toast hook after saving.

---

## PHASE 2 — Dashboard & Data Improvements

---

### 2.1 — Live Dashboard Data

**File to edit:** `src/pages/Index.tsx` and `src/hooks/useDashboard.ts` (create this file)

**What to do:**
- The dashboard likely shows hardcoded placeholder numbers (total balance, income, expenses).
- Replace all of them with real data from Supabase via React Query.

**Step-by-step:**

1. Create a `useDashboardStats` hook:
```ts
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type, date')
        .eq('user_id', user?.id);

      const income = transactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) ?? 0;

      const expenses = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) ?? 0;

      return {
        totalBalance: income - expenses,
        totalIncome: income,
        totalExpenses: expenses,
        recentTransactions: transactions?.slice(0, 5) ?? [],
      };
    },
  });
}
```

2. Use this hook in `Index.tsx` and replace all hardcoded values with `data.totalBalance`, `data.totalIncome`, etc.
3. Show a loading skeleton while `isLoading` is true.

---

### 2.2 — Working Charts in Reports Page

**File to edit:** `src/pages/Reports.tsx`

**What to do:**
- Charts in the Reports page show no data or fake data.
- Connect them to real Supabase transaction data grouped by category and date.

**Step-by-step:**

1. Create a `useReportData` hook that fetches and groups transactions:
```ts
export function useReportData(month: string) {
  return useQuery({
    queryKey: ['reports', month],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data } = await supabase
        .from('transactions')
        .select('amount, type, category_id, date, categories(name)')
        .eq('user_id', user?.id)
        .gte('date', `${month}-01`)
        .lte('date', `${month}-31`);

      // Group by category for pie/bar chart
      const byCategory = data?.reduce((acc, t) => {
        const name = t.categories?.name ?? 'Other';
        acc[name] = (acc[name] ?? 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

      // Format for Recharts
      const categoryData = Object.entries(byCategory ?? {}).map(([name, value]) => ({ name, value }));

      return { categoryData, rawTransactions: data };
    },
  });
}
```

2. Pass `categoryData` into your existing Recharts `<PieChart>` or `<BarChart>` component as the `data` prop.
3. Add a month selector (use a `<select>` or shadcn `Select`) so users can change the reporting period.

---

### 2.3 — Filter & Search on Transactions Page

**File to edit:** `src/pages/Transactions.tsx`

**What to do:**
- Add working filter controls: by type (income/expense), by category, and by date range.
- Add a search input that filters by description.

**Step-by-step:**

1. Add filter state:
```ts
const [search, setSearch] = useState('');
const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
const [categoryFilter, setCategoryFilter] = useState<string>('all');
```

2. Pass filters into your Supabase query:
```ts
let query = supabase.from('transactions').select('*, categories(name)').eq('user_id', user?.id);

if (typeFilter !== 'all') query = query.eq('type', typeFilter);
if (categoryFilter !== 'all') query = query.eq('category_id', categoryFilter);
if (search) query = query.ilike('description', `%${search}%`);
```

3. Use `queryKey: ['transactions', { search, typeFilter, categoryFilter }]` so React Query refetches when filters change.

---

### 2.4 — Budget Progress Bars

**File to edit:** Budget page or Dashboard page

**What to do:**
- For each budget category, show how much has been spent vs the set limit using a progress bar.

**Step-by-step:**

1. Fetch both budgets and transactions for the current month.
2. For each budget, calculate `spent = sum of transactions in that category this month`.
3. Calculate `percentage = (spent / budget.amount) * 100`.
4. Render a progress bar:
```tsx
<div className="w-full bg-gray-200 rounded-full h-2">
  <div
    className={`h-2 rounded-full ${percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
    style={{ width: `${Math.min(percentage, 100)}%` }}
  />
</div>
<p className="text-sm text-muted-foreground mt-1">
  ${spent.toFixed(2)} / ${budget.amount.toFixed(2)}
</p>
```

---

## PHASE 3 — Polish Features

---

### 3.1 — Export Transactions as CSV

**File to edit:** `src/pages/Transactions.tsx`

**What to do:**
- Add an "Export CSV" button that downloads the user's transactions as a `.csv` file.

**Implementation:**
```ts
const exportCSV = (transactions: Transaction[]) => {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
  const rows = transactions.map(t => [
    t.date,
    t.description,
    t.category_name,
    t.type,
    t.amount,
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transactions.csv';
  a.click();
  URL.revokeObjectURL(url);
};
```

- Wire this to a button: `<Button onClick={() => exportCSV(transactions)}>Export CSV</Button>`

---

### 3.2 — Recurring Transactions

**File to edit:** Add a new field to the transaction form and a Supabase column.

**What to do:**
- Allow users to mark a transaction as recurring (weekly, monthly).
- Store recurrence info in the database.

**Step-by-step:**

1. Add a `recurrence` column to the `transactions` table:
```sql
alter table transactions add column recurrence text default null;
-- values: null, 'weekly', 'monthly', 'yearly'
```

2. Add a `recurrence` select field to the Add Transaction form.
3. Create a Supabase Edge Function or a manual process that checks for recurring transactions and inserts new ones each month. (This is advanced — for now, just store the recurrence type and show a badge on the transaction.)

---

### 3.3 — Dark Mode Toggle

**File to edit:** `src/components/AppLayout.tsx` or `src/pages/Settings.tsx`

**What to do:**
- Add a button to toggle between light and dark mode.
- Tailwind's dark mode uses the `dark` class on the `<html>` element.

**Implementation:**
```ts
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem(
    'theme',
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
};

// On app load (in main.tsx or App.tsx), restore preference:
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') document.documentElement.classList.add('dark');
```

- Make sure `tailwind.config.ts` has `darkMode: 'class'`.

---

### 3.4 — Over-Budget Alerts (Toast Notifications)

**File to edit:** Wherever budget data is fetched — Dashboard or Budget page.

**What to do:**
- After fetching budgets and spending data, check if any category has exceeded its budget.
- Show a toast notification for each over-budget category.

**Implementation:**
```ts
useEffect(() => {
  if (!budgetData) return;

  budgetData.forEach(budget => {
    if (budget.spent >= budget.amount) {
      toast({
        title: 'Budget Exceeded',
        description: `You've exceeded your ${budget.categoryName} budget!`,
        variant: 'destructive',
      });
    } else if (budget.spent >= budget.amount * 0.8) {
      toast({
        title: 'Budget Warning',
        description: `You're at ${Math.round((budget.spent / budget.amount) * 100)}% of your ${budget.categoryName} budget.`,
      });
    }
  });
}, [budgetData]);
```

- Use the existing `useToast` hook from `src/hooks/` (it's already in the project).

---

## General Notes for Gemini

- Always use `supabase.auth.getUser()` to get the current user ID before any database operation.
- Always invalidate relevant React Query keys after mutations so the UI stays in sync.
- Use the existing `src/lib/supabase.ts` client — do not create a new one.
- Use `shadcn/ui` components (Button, Dialog, Input, Select, AlertDialog) for all UI — do not use plain HTML elements for interactive controls.
- All forms must use `react-hook-form` with `zodResolver` — no uncontrolled forms.
- TypeScript types for Transaction, Category, and Budget are in `src/types/finance.ts` — use them everywhere.
