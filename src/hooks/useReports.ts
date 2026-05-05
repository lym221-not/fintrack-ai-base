import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useReportData(month: number, year: number) {
  return useQuery({
    queryKey: ['reports', month, year],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type, category_id, date, categories(name, color)')
        .eq('user_id', user.id)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date', { ascending: false });

      if (error) throw error;

      // Fetch previous month
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevMonthStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
      const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
      const prevMonthEnd = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevLastDay).padStart(2, '0')}`;

      const { data: prevData } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .gte('date', prevMonthStart)
        .lte('date', prevMonthEnd);

      const curExpense = (data || []).filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const curIncome = (data || []).filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const prevExpense = (prevData || []).filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const prevIncome = (prevData || []).filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

      // Group by category for pie/bar chart
      const byCategory = (data || []).reduce((acc: Record<string, { value: number; color: string }>, t: any) => {
        if (t.type !== 'expense') return acc; // Only expenses typically in this breakdown
        const name = t.categories?.name ?? 'Other';
        const color = t.categories?.color ?? '#6b7280';
        
        if (!acc[name]) {
          acc[name] = { value: 0, color };
        }
        acc[name].value += t.amount;
        return acc;
      }, {});

      // Format for Recharts
      const categoryData = Object.entries(byCategory).map(([name, { value, color }]) => ({ 
        name, 
        value,
        color
      })).sort((a, b) => b.value - a.value);

      const insights = [];
      if (categoryData.length > 0) {
        insights.push(`Your biggest expense category is ${categoryData[0].name}.`);
      }
      
      const savedCur = curIncome - curExpense;
      const savedPrev = prevIncome - prevExpense;
      if (savedCur > savedPrev) {
        insights.push(`You saved ${(savedCur - savedPrev).toLocaleString()} THB more than last month.`);
      } else if (savedPrev > savedCur) {
        insights.push(`You saved ${(savedPrev - savedCur).toLocaleString()} THB less than last month.`);
      }

      const comparisonData = [
        { name: 'Last Month', Income: prevIncome, Expense: prevExpense },
        { name: 'This Month', Income: curIncome, Expense: curExpense },
      ];

      return { 
        categoryData, 
        rawTransactions: data || [], 
        insights, 
        comparisonData 
      };
    },
  });
}
