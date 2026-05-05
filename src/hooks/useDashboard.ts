import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Transaction, Budget } from '@/types/finance';

export function useDashboardStats(month: number, year: number) {
  return useQuery({
    queryKey: ['dashboard', month, year],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      // Fetch transactions for the current month
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*, categories(name, color)')
        .eq('user_id', user.id)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date', { ascending: false });

      // Fetch budgets for the current month
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*, categories(name)')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year);

      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, color, icon')
        .eq('user_id', user.id);

      const income = transactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) ?? 0;

      const expenses = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) ?? 0;

      const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

      // Calculate Category Expenses for Pie Chart
      const categoryTotals: Record<string, number> = {};
      transactions?.filter(t => t.type === 'expense').forEach(t => {
        const catName = t.categories?.name || 'Other';
        categoryTotals[catName] = (categoryTotals[catName] || 0) + t.amount;
      });
      const categoryExpenses = Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const topCategory = categoryExpenses.length > 0 ? categoryExpenses[0].name : 'N/A';

      // Calculate Daily Expenses for Line Chart
      const dailyTotals: Record<string, number> = {};
      transactions?.filter(t => t.type === 'expense').forEach(t => {
        const dateStr = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + t.amount;
      });
      const dailyExpenses = Object.entries(dailyTotals)
        .map(([date, amount]) => ({ date, amount }))
        .reverse(); // Reverse so older dates are first if they were ordered desc

      const budgetsWithSpent = (budgets || []).map((budget: Budget) => ({
        ...budget,
        spent: (transactions || [])
          .filter(t => t.category_id === budget.category_id && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
      }));

      return {
        totalBalance: income - expenses,
        totalIncome: income,
        totalExpenses: expenses,
        savingsRate,
        topCategory,
        categoryExpenses,
        dailyExpenses,
        recentTransactions: (transactions || []).slice(0, 5),
        budgets: budgetsWithSpent,
        categories: categories || [],
        allTransactions: transactions || [],
      };
    },
  });
}
