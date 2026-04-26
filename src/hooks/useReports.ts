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

      return { categoryData, rawTransactions: data || [] };
    },
  });
}
