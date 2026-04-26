import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  UtensilsCrossed,
  Briefcase,
  Car,
  ShoppingBag,
  Heart,
  Pencil,
  Trash2,
  Send,
  ArrowRight,
  PiggyBank,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/* ── Category Meta ── */
const categoryMeta: Record<string, { icon: React.ElementType; bg: string; text: string }> = {
  Food: { icon: UtensilsCrossed, bg: "bg-orange-500/20", text: "text-orange-400" },
  Income: { icon: Briefcase, bg: "bg-primary/20", text: "text-primary" },
  Transport: { icon: Car, bg: "bg-blue/20", text: "text-blue" },
  Shopping: { icon: ShoppingBag, bg: "bg-purple-500/20", text: "text-purple-400" },
  Health: { icon: Heart, bg: "bg-rose-500/20", text: "text-rose-400" },
  Rent: { icon: Briefcase, bg: "bg-yellow-500/20", text: "text-yellow-400" },
  Travel: { icon: Car, bg: "bg-cyan-500/20", text: "text-cyan-400" },
  Other: { icon: Wallet, bg: "bg-muted", text: "text-muted-foreground" },
};

function budgetBarColor(spent: number, limit: number) {
  const ratio = spent / limit;
  if (ratio >= 1) return "bg-expense";
  if (ratio >= 0.8) return "bg-amber";
  return "bg-primary";
}

const Index = () => {
  const currentDate = new Date();
  const [currentMonth] = useState(currentDate.getMonth() + 1);
  const [currentYear] = useState(currentDate.getFullYear());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const upsertBudget = useMutation({
    mutationFn: async ({ category_id, limit_amount }: { category_id: string; limit_amount: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('budgets').upsert(
        { user_id: user!.id, category_id, limit_amount, month: currentMonth, year: currentYear },
        { onConflict: 'user_id,category_id,month,year' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Budget saved!' });
    },
    onError: () => toast({ title: 'Failed to save budget', variant: 'destructive' }),
  });

  const handleSaveBudget = async (category_id: string) => {
    const val = parseFloat(budgetInputs[category_id]);
    if (!val || val <= 0) return;
    setSavingId(category_id);
    await upsertBudget.mutateAsync({ category_id, limit_amount: val });
    setSavingId(null);
    setBudgetInputs(prev => ({ ...prev, [category_id]: '' }));
    setEditingId(null);
  };

  const { data, isLoading } = useDashboardStats(currentMonth, currentYear);

  useEffect(() => {
    if (!data?.budgets) return;

    data.budgets.forEach(budget => {
      const pct = (budget.spent / budget.limit_amount) * 100;
      if (budget.spent >= budget.limit_amount) {
        toast({
          title: 'Budget Exceeded',
          description: `You've exceeded your ${budget.categories?.name} budget!`,
          variant: 'destructive',
        });
      } else if (pct >= 80) {
        toast({
          title: 'Budget Warning',
          description: `You're at ${Math.round(pct)}% of your ${budget.categories?.name} budget.`,
        });
      }
    });
  }, [data?.budgets, toast]);

  const stats = [
    {
      label: "Current Balance",
      value: data?.totalBalance?.toLocaleString() ?? "0",
      trend: "+0.0%",
      positive: (data?.totalBalance ?? 0) >= 0,
      accent: true,
      icon: Wallet
    },
    {
      label: "Total Income",
      value: data?.totalIncome?.toLocaleString() ?? "0",
      trend: "+0.0%",
      positive: true,
      accent: false,
      icon: TrendingUp
    },
    {
      label: "Total Expenses",
      value: data?.totalExpenses?.toLocaleString() ?? "0",
      trend: "-0.0%",
      positive: false,
      accent: false,
      icon: TrendingDown
    },
  ];

  const currentMonthLabel = new Date(currentYear, currentMonth - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1200px]">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="animate-pulse bg-muted rounded w-32 h-4 mb-2" />
          <div className="animate-pulse bg-muted rounded w-48 h-8" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-card border border-border rounded-xl p-5">
              <div className="bg-muted rounded w-24 h-4 mb-3" />
              <div className="bg-muted rounded w-32 h-8 mb-2" />
              <div className="bg-muted rounded w-20 h-4" />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-8">
          <div className="xl:col-span-3 animate-pulse bg-card border border-border rounded-xl p-5">
            <div className="bg-muted rounded w-32 h-6 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-muted rounded h-12" />
              ))}
            </div>
          </div>
          <div className="xl:col-span-2 animate-pulse bg-card border border-border rounded-xl p-5">
            <div className="bg-muted rounded w-20 h-6 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="bg-muted rounded w-full h-2 mb-1" />
                  <div className="bg-muted rounded w-16 h-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      <p className="font-mono-dm text-[11px] uppercase tracking-[0.2em] text-primary mb-1">
        {currentMonthLabel}
      </p>
      <h1 className="font-display text-3xl text-foreground mb-8">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`relative rounded-xl border bg-card p-5 transition-colors ${s.accent
                ? "border-primary/40 shadow-[0_0_24px_-6px_hsl(var(--primary)/0.15)]"
                : "border-border"
              }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {s.label}
              </span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-dm text-[28px] leading-none font-medium text-foreground">
                {s.value}
              </span>
              <span className="text-xs text-muted-foreground">THB</span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {s.positive ? (
                <ArrowUpRight className="h-3 w-3 text-income" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-expense" />
              )}
              <span className={`font-mono-dm text-xs font-medium ${s.positive ? "text-income" : "text-expense"}`}>
                {s.trend}
              </span>
              <span className="text-[10px] text-muted-foreground ml-1">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-8">
        <div className="xl:col-span-3 rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-lg text-foreground mb-4">Recent Transactions</h2>
          <div className="space-y-1">
            {data?.recentTransactions?.map((tx: any) => {
              const categoryName = tx.categories?.name || "Other";
              const meta = categoryMeta[categoryName] ?? categoryMeta["Other"];
              const Icon = meta.icon;
              const isIncome = tx.type === 'income';
              const formattedDate = new Date(tx.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });
              return (
                <div
                  key={tx.id}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 -mx-3 transition-colors hover:bg-muted/50"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
                    <Icon className={`h-4 w-4 ${meta.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{tx.description}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {categoryName} · {formattedDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono-dm text-sm font-medium ${isIncome ? "text-income" : "text-expense"}`}
                    >
                      {isIncome ? "+" : "-"}
                      {Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
            {(!data?.recentTransactions || data.recentTransactions.length === 0) && (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent transactions</p>
            )}
          </div>
          <Link
            to="/transactions"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all transactions <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="xl:col-span-2 rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-lg text-foreground mb-4">Budgets</h2>
          
          {(() => {
            if (!data) return null;
            
            const mergedCategories = (data.categories || []).map((cat: any) => {
              const budget = (data.budgets || []).find((b: any) => b.category_id === cat.id);
              return { cat, budget };
            });

            const hasBudgets = (data.budgets || []).length > 0;

            if (!hasBudgets) {
              return (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-6">
                    <PiggyBank className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground text-center">No budgets set for this month</p>
                    <p className="text-xs text-muted-foreground/60 text-center">Set a limit for any category below</p>
                  </div>
                  <div className="space-y-4">
                    {mergedCategories.map(({ cat }: any) => (
                      <div key={cat.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground">{cat.name}</span>
                          <div className="mt-1.5 h-2 w-full rounded-full border border-dashed border-border" />
                        </div>
                        <div className="ml-4 flex items-center gap-2 mt-4">
                          <input
                            type="number"
                            placeholder="Set limit..."
                            className="h-7 w-28 rounded-md border border-border bg-muted px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            value={budgetInputs[cat.id] || ''}
                            onChange={e => setBudgetInputs(prev => ({ ...prev, [cat.id]: e.target.value }))}
                          />
                          <button
                            onClick={() => handleSaveBudget(cat.id)}
                            disabled={savingId === cat.id}
                            className="h-7 px-2 rounded-md bg-primary text-[11px] font-semibold text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
                          >
                            {savingId === cat.id ? '...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            const onTrackCount = (data.budgets || []).filter((b: any) => (b.spent / b.limit_amount) < 0.8).length;
            const totalCount = (data.budgets || []).length;
            const anyOver = (data.budgets || []).some((b: any) => b.spent >= b.limit_amount);
            const anyRisk = (data.budgets || []).some((b: any) => (b.spent / b.limit_amount) >= 0.8 && b.spent < b.limit_amount);
            const dotColor = anyOver ? 'bg-expense' : anyRisk ? 'bg-amber' : 'bg-primary';

            const totalLimit = (data.budgets || []).reduce((s: number, b: any) => s + Number(b.limit_amount), 0);
            const totalSpent = (data.budgets || []).reduce((s: number, b: any) => s + b.spent, 0);
            const totalRemaining = totalLimit - totalSpent;
            const totalPct = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;
            const isTotalOver = totalSpent > totalLimit;

            return (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/40 p-3 mb-4">
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

                <div className="flex items-center gap-2 mb-4">
                  <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                  <span className="text-xs text-muted-foreground">{onTrackCount} of {totalCount} categories on track</span>
                </div>
                
                {mergedCategories.map(({ cat, budget }: any) => {
                  if (budget) {
                    const pct = Math.min((budget.spent / budget.limit_amount) * 100, 100);
                    const over = budget.spent >= budget.limit_amount;
                    const isEditing = editingId === cat.id;

                    return (
                      <div key={cat.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">{cat.name}</span>
                            <button onClick={() => setEditingId(isEditing ? null : cat.id)} className="text-muted-foreground hover:text-foreground">
                              <Pencil className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-mono-dm text-xs text-muted-foreground">
                            {budget.spent.toLocaleString()}{" "}
                            <span className="text-muted-foreground/60">/ {budget.limit_amount.toLocaleString()} THB</span>
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${budgetBarColor(budget.spent, budget.limit_amount)}`}
                            style={{ width: `${over ? 100 : pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          {over ? (
                            <p className="text-[10px] font-medium text-expense">
                              Over budget by {(budget.spent - budget.limit_amount).toLocaleString()} THB
                            </p>
                          ) : <div />}
                          
                          {isEditing && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="New limit..."
                                className="h-7 w-28 rounded-md border border-border bg-muted px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                value={budgetInputs[cat.id] || ''}
                                onChange={e => setBudgetInputs(prev => ({ ...prev, [cat.id]: e.target.value }))}
                              />
                              <button
                                onClick={() => handleSaveBudget(cat.id)}
                                disabled={savingId === cat.id}
                                className="h-7 px-2 rounded-md bg-primary text-[11px] font-semibold text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
                              >
                                {savingId === cat.id ? '...' : 'Save'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={cat.id} className="flex items-center justify-between mt-4">
                      <div className="flex-1">
                        <span className="text-sm text-muted-foreground">{cat.name}</span>
                        <div className="mt-1.5 h-2 w-full rounded-full border border-dashed border-border" />
                      </div>
                      <div className="ml-4 flex items-center gap-2 mt-4">
                        <input
                          type="number"
                          placeholder="Set limit..."
                          className="h-7 w-28 rounded-md border border-border bg-muted px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          value={budgetInputs[cat.id] || ''}
                          onChange={e => setBudgetInputs(prev => ({ ...prev, [cat.id]: e.target.value }))}
                        />
                        <button
                          onClick={() => handleSaveBudget(cat.id)}
                          disabled={savingId === cat.id}
                          className="h-7 px-2 rounded-md bg-primary text-[11px] font-semibold text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
                        >
                          {savingId === cat.id ? '...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <Link
            to="/budgets"
            className="mt-6 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Manage budgets <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-blue/20 bg-blue/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue/20">
          <Send className="h-5 w-5 text-blue" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-base text-foreground">Connect Telegram</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add transactions by typing naturally — <span className="font-mono-dm text-foreground/70">spent 350 on lunch</span>
          </p>
        </div>
        <button className="rounded-lg bg-blue px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-blue/80">
          Connect
        </button>
      </div>
    </div>
  );
};

export default Index;
