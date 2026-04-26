import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function useUpsertBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { category_id: string; limit_amount: number; month: number; year: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('budgets').upsert({
        ...data,
        user_id: user.id,
      }, { onConflict: 'user_id,category_id,month,year' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: 'Budget saved',
        description: 'Your budget has been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error saving budget',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}
