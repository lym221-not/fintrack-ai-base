import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

export const transactionSchema = z.object({
  amount: z.coerce.number({ invalid_type_error: 'Amount is required' }).positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  category_id: z.string().min(1, 'Select a category'),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'Date is required'),
  recurrence: z.enum(['none', 'weekly', 'monthly', 'yearly']).optional().default('none'),
});

export type TransactionForm = z.infer<typeof transactionSchema>;

export function useAddTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: TransactionForm) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase.from('transactions').insert({
        ...data,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: 'Transaction added',
        description: 'Your transaction has been successfully added.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error adding transaction',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: 'Transaction updated',
        description: 'Your transaction has been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating transaction',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: 'Transaction deleted',
        description: 'Your transaction has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting transaction',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}

import { useQuery } from '@tanstack/react-query';

export function useTransactionsQuery(filters?: { type?: 'all' | 'income' | 'expense', category?: string, search?: string }) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('transactions')
        .select('*, categories(name, color)')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters?.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let filtered = data || [];
      if (filters?.category && filters.category !== 'All') {
        filtered = filtered.filter(tx => tx.categories?.name === filters.category);
      }

      return filtered;
    }
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;

      if (!data || data.length === 0) {
        const defaultCategories = [
          { name: 'Food',      color: '#f97316', icon: '🍔' },
          { name: 'Transport', color: '#60a5fa', icon: '🚗' },
          { name: 'Shopping',  color: '#a855f7', icon: '🛍️' },
          { name: 'Health',    color: '#f87171', icon: '❤️' },
          { name: 'Rent',      color: '#fbbf24', icon: '🏠' },
          { name: 'Travel',    color: '#22d3ee', icon: '✈️' },
          { name: 'Other',     color: '#6b7280', icon: '📦' },
        ];

        const { data: inserted } = await supabase
          .from('categories')
          .insert(defaultCategories.map(c => ({ ...c, user_id: user.id })))
          .select();

        return inserted || [];
      }

      return data;
    }
  });
}

