import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, PiggyBank } from "lucide-react";

type CategoryBudget = {
  categoryId: string;
  categoryName: string;
  limitAmount: number | null;
  spent: number;
};

function budgetBarColor(spent: number, limit: number) {
  const ratio = spent / limit;
  if (ratio >= 1) return "bg-expense";
  if (ratio >= 0.8) return "bg-amber";
  return "bg-primary";
}

const Budgets = () => {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isCurrentMonth = viewMonth === today.getMonth() + 1 && viewYear === today.getFullYear();
  const isPastMonth = viewYear < today.getFullYear() || (viewYear === today.getFullYear() && viewMonth < today.getMonth() + 1);
  const isFutureLimit = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth() + 12);

  const goPrev = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goNext = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const { data: budgetsData, isLoading } = useQuery({
    queryKey: ['budgetsPage', viewMonth, viewYear],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const monthStart = `${viewYear}-${String(viewMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(viewYear, viewMonth, 0).getDate();
      const monthEnd = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const [categoriesRes, budgetsRes, transactionsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('user_id', user.id),
        supabase.from('budgets').select('*').eq('user_id', user.id).eq('month', viewMonth).eq('year', viewYear),
        supabase.from('transactions').select('*').eq('user_id', user.id).gte('date', monthStart).lte('date', monthEnd).eq('type', 'expense')
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (budgetsRes.error) throw budgetsRes.error;
      if (transactionsRes.error) throw transactionsRes.error;

      const categories = categoriesRes.data || [];
      const budgets = budgetsRes.data || [];
      const transactions = transactionsRes.data || [];

      return categories.map(cat => {
        const budget = budgets.find(b => b.category_id === cat.id);
        const spent = transactions
          .filter(t => t.category_id === cat.id)
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          categoryId: cat.id,
          categoryName: cat.name,
          limitAmount: budget ? budget.limit_amount : null,
          spent
        } as CategoryBudget;
      });
    }
  });

  const upsertBudgetMutation = useMutation({
    mutationFn: async ({ categoryId, limitAmount }: { categoryId: string, limitAmount: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('budgets').upsert({
        user_id: user.id,
        category_id: categoryId,
        month: viewMonth,
        year: viewYear,
        limit_amount: limitAmount,
      }, {
        onConflict: 'user_id,category_id,month,year'
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetsPage', viewMonth, viewYear] });
      toast({ title: 'Success', description: 'Budget updated successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update budget.', variant: 'destructive' });
    }
  });

  const handleLimitChange = (categoryId: string, value: string) => {
    setInputValues(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleSave = (categoryId: string) => {
    const valueStr = inputValues[categoryId];
    // If the user hasn't typed anything yet, don't do anything or read the existing budget.
    if (valueStr === undefined) return;
    
    const limitAmount = parseFloat(valueStr);
    if (!isNaN(limitAmount) && limitAmount >= 0) {
      upsertBudgetMutation.mutate({ categoryId, limitAmount });
    } else {
      toast({ title: 'Invalid amount', description: 'Please enter a valid positive number.', variant: 'destructive' });
    }
  };

  const currentMonthLabel = new Date(viewYear, viewMonth - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1200px]">
        <div className="mb-8">
          <div className="animate-pulse bg-muted rounded w-32 h-4 mb-2" />
          <div className="animate-pulse bg-muted rounded w-48 h-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-card border border-border rounded-xl p-5 flex flex-col h-40">
              <div className="bg-muted rounded w-32 h-6 mb-4" />
              <div className="bg-muted rounded w-full h-2 mb-1" />
              <div className="bg-muted rounded w-16 h-3 mb-auto" />
              <div className="flex gap-2 mt-4">
                <div className="bg-muted rounded w-full h-9" />
                <div className="bg-muted rounded w-20 h-9" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      <p className="font-mono-dm text-[11px] uppercase tracking-[0.2em] text-primary mb-1">
        {currentMonthLabel}
      </p>
      <h1 className="font-display text-3xl text-foreground mb-4">Budgets</h1>

      <div className="flex items-center justify-center mb-8">
        <button 
          onClick={goPrev}
          className="rounded-lg border border-border bg-card p-2 hover:bg-muted transition-colors text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="font-display text-lg text-foreground mx-6 w-32 text-center">{currentMonthLabel}</h2>
        <button 
          onClick={goNext}
          disabled={isFutureLimit}
          className="rounded-lg border border-border bg-card p-2 hover:bg-muted transition-colors text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {isPastMonth && (
        <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground mb-6 inline-block">
          Viewing a past month — budgets are read-only
        </div>
      )}

      {budgetsData && budgetsData.length > 0 ? (
        <>
          {(() => {
            const totalLimit = budgetsData.reduce((s, b) => s + Number(b.limitAmount || 0), 0);
            if (totalLimit === 0 && isPastMonth) return null; // Or show zero state

            const totalSpent = budgetsData.reduce((s, b) => s + b.spent, 0);
            const totalRemaining = totalLimit - totalSpent;
            const totalPct = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;
            const isTotalOver = totalSpent > totalLimit;

            if (totalLimit === 0) return null; // only show summary if there are budgets set

            return (
              <div className="rounded-lg bg-muted/40 p-3 mb-6 xl:w-[calc(66.666%-0.5rem)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Budget</span>
                  <span className="font-mono-dm text-xs text-foreground">{totalSpent.toLocaleString()} / {totalLimit.toLocaleString()} THB</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted mb-2">
                  <div 
                    className={`h-full rounded-full transition-all ${budgetBarColor(totalSpent, totalLimit)}`}
                    style={{ width: `${isTotalOver ? 100 : totalPct}%` }}
                  />
                </div>
                {isTotalOver ? (
                  <p className="text-xs text-expense font-medium">Over total budget by {Math.abs(totalRemaining).toLocaleString()} THB</p>
                ) : (
                  <p className="text-xs text-muted-foreground">{totalRemaining.toLocaleString()} THB remaining this month</p>
                )}
              </div>
            );
          })()}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {budgetsData.map((data) => {
              const { categoryId, categoryName, limitAmount, spent } = data;
              const limit = limitAmount || 0;
              const hasBudget = limit > 0;
              const pct = hasBudget ? Math.min((spent / limit) * 100, 100) : 0;
              const over = hasBudget && spent > limit;

              return (
                <div key={categoryId} className="rounded-xl border border-border bg-card p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg text-foreground">{categoryName}</h3>
                  </div>

                  {hasBudget ? (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono-dm text-xs text-muted-foreground">
                          {spent.toLocaleString()} / {limit.toLocaleString()} THB
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${budgetBarColor(spent, limit)}`}
                          style={{ width: `${over ? 100 : pct}%` }}
                        />
                      </div>
                      {over && (
                        <p className="mt-1.5 text-[11px] font-medium text-expense">
                          Over budget by {(spent - limit).toLocaleString()} THB
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">No budget set.</p>
                    </div>
                  )}

                  {!isPastMonth && (
                    <div className="mt-auto flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Amount"
                        className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                        value={inputValues[categoryId] !== undefined ? inputValues[categoryId] : (limit ? String(limit) : "")}
                        onChange={(e) => handleLimitChange(categoryId, e.target.value)}
                        disabled={isPastMonth}
                      />
                      <button
                        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleSave(categoryId)}
                        disabled={isPastMonth || upsertBudgetMutation.isPending || inputValues[categoryId] === undefined}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <PiggyBank className="h-8 w-8 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">No budgets were set for this month</p>
        </div>
      )}
    </div>
  );
};

export default Budgets;
