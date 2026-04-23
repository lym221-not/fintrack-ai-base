import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Transaction, Category, TransactionType } from "@/types/finance";

/* ── Category colors ── */
const categoryColors: Record<string, { bg: string; text: string }> = {
  Food: { bg: "bg-orange-500", text: "text-orange-400" },
  Transport: { bg: "bg-blue", text: "text-blue" },
  Shopping: { bg: "bg-purple-500", text: "text-purple-400" },
  Health: { bg: "bg-rose-500", text: "text-rose-400" },
  Income: { bg: "bg-primary", text: "text-primary" },
  Rent: { bg: "bg-yellow-500", text: "text-yellow-400" },
  Travel: { bg: "bg-cyan-500", text: "text-cyan-400" },
  Other: { bg: "bg-gray-500", text: "text-gray-400" },
};

type TypeFilter = "all" | "income" | "expense";

const Transactions = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* Modal form state */
  const [formType, setFormType] = useState<TransactionType>("expense");
  const [formAmount, setFormAmount] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<string>("");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .order('name');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // If no categories exist, insert default ones
        if (categoriesData && categoriesData.length === 0) {
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

          if (inserted) setCategories(inserted);
        }

        // Set default category if available
        const finalCategories = categoriesData?.length > 0 ? categoriesData : (await supabase.from('categories').select('*').eq('user_id', user.id).order('name')).data || [];
        if (finalCategories && finalCategories.length > 0) {
          setFormCategoryId(finalCategories[0].id);
        }

        // Fetch transactions with category join
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*, categories(name, color)')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (transactionsError) throw transactionsError;
        setTransactions(transactionsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter === "income" && tx.type !== "income") return false;
      if (typeFilter === "expense" && tx.type !== "expense") return false;
      if (categoryFilter !== "All" && tx.categories?.name !== categoryFilter) return false;
      if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, typeFilter, categoryFilter, transactions]);

  const allCategories = useMemo(() => ["All", ...categories.map(c => c.name)], [categories]);

  const net = filtered.reduce((s, tx) => s + tx.amount, 0);

  const typePills: { label: string; value: TypeFilter }[] = [
    { label: "All", value: "all" },
    { label: "Income", value: "income" },
    { label: "Expense", value: "expense" },
  ];

  const resetForm = () => {
    setFormType("expense");
    setFormAmount("");
    setFormCategoryId(categories.length > 0 ? categories[0].id : "");
    setFormDesc("");
    setFormDate(new Date());
  };

  const handleSave = async () => {
    if (!formAmount || !formCategoryId || !formDesc || !formDate) return;
    
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount: Number(formAmount),
        type: formType,
        category_id: formCategoryId,
        description: formDesc,
        date: formDate.toISOString().split('T')[0]
      });

      if (error) throw error;

      // Re-fetch transactions to update UI
      const { data: newTransactions } = await supabase
        .from('transactions')
        .select('*, categories(name, color)')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      setTransactions(newTransactions || []);
      setModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (transaction: Transaction) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', transaction.id);
      if (error) throw error;
      
      // Optimistic update
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1200px]">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-muted rounded-xl h-14" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 max-w-[1200px]">
        <div className="text-expense text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono-dm text-[11px] uppercase tracking-[0.2em] text-primary mb-1">March 2026</p>
          <h1 className="font-display text-3xl text-foreground">Transactions</h1>
        </div>
        <Dialog open={modalOpen} onOpenChange={(o) => { setModalOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-foreground">New Transaction</DialogTitle>
            </DialogHeader>
            {/* Type toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setFormType("expense")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium transition-colors",
                  formType === "expense" ? "bg-expense/15 text-expense" : "text-muted-foreground hover:bg-muted"
                )}
              >
                Expense
              </button>
              <button
                onClick={() => setFormType("income")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium transition-colors",
                  formType === "income" ? "bg-income/15 text-income" : "text-muted-foreground hover:bg-muted"
                )}
              >
                Income
              </button>
            </div>
            {/* Amount */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Amount (THB)</label>
              <Input
                type="number"
                placeholder="0"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="font-mono-dm text-2xl h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {/* Category */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Category</label>
              <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Description */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Description</label>
              <Input
                placeholder="What was this for?"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {/* Date */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-muted border-border", !formDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formDate ? format(formDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                  <Calendar mode="single" selected={formDate} onSelect={setFormDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            <Button 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2" 
              onClick={handleSave}
              disabled={saving || !formAmount || !formCategoryId || !formDesc || !formDate}
            >
              {saving ? "Saving…" : "Save Transaction"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter bar */}
      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {/* Type pills */}
          <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
            {typePills.map((p) => (
              <button
                key={p.value}
                onClick={() => setTypeFilter(p.value)}
                className={cn(
                  "px-4 py-2 text-xs font-medium transition-colors",
                  typeFilter === p.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          {/* Category */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] bg-muted border-border text-foreground shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {allCategories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Count & Net */}
      <div className="flex items-center justify-between px-1 mb-3">
        <span className="font-mono-dm text-xs text-muted-foreground">
          {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
        </span>
        <span className={cn("font-mono-dm text-xs font-medium", net >= 0 ? "text-income" : "text-expense")}>
          Net: {net >= 0 ? "+" : "−"}{Math.abs(net).toLocaleString()} THB
        </span>
      </div>

      {/* Transaction list */}
      {error && (
        <div className="text-expense text-center mb-4">{error}</div>
      )}
      <div className="rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((tx) => {
              const categoryName = tx.categories?.name || "Other";
              const meta = categoryColors[categoryName] || categoryColors.Other;
              const isIncome = tx.type === "income";
              return (
                <div
                  key={tx.id}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
                >
                  {/* Category square */}
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white", meta.bg)}>
                    {categoryName[0]}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{tx.description}</p>
                    <p className="text-[11px]">
                      <span className={meta.text}>{categoryName}</span>
                      <span className="text-muted-foreground"> · </span>
                      <span className="font-mono-dm text-muted-foreground">{formatDate(tx.date)}</span>
                    </p>
                  </div>
                  {/* Amount + actions */}
                  <div className="flex items-center gap-3">
                    <span className={cn("font-mono-dm text-sm font-medium", isIncome ? "text-income" : "text-expense")}>
                      {isIncome ? "+" : "−"}{Math.abs(tx.amount).toLocaleString()}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        className="rounded p-1.5 text-muted-foreground hover:text-expense hover:bg-muted"
                        onClick={() => handleDelete(tx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
