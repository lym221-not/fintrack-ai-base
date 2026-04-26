import { useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2, CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { 
  transactionSchema, 
  TransactionForm, 
  useAddTransaction, 
  useUpdateTransaction, 
  useDeleteTransaction,
  useTransactionsQuery,
  useCategoriesQuery
} from "@/hooks/useTransactions";

const categoryColors: Record<string, { bg: string; text: string }> = {
  Food: { bg: "bg-orange-500", text: "text-orange-400" },
  Transport: { bg: "bg-blue-500", text: "text-blue-400" },
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
  const [editingId, setEditingId] = useState<string | null>(null);

  // Queries
  const { data: categories = [] } = useCategoriesQuery();
  const { data: transactions = [], isLoading } = useTransactionsQuery({
    search,
    type: typeFilter,
    category: categoryFilter
  });

  // Mutations
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  // Form setup
  const { register, handleSubmit, formState: { errors }, reset, control, setValue, watch } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split('T')[0],
      amount: undefined,
      description: "",
      category_id: "",
      recurrence: "none",
    }
  });

  const formType = watch("type");

  const onSubmit = async (data: TransactionForm) => {
    if (editingId) {
      await updateTransaction.mutateAsync({ id: editingId, data });
    } else {
      await addTransaction.mutateAsync(data);
    }
    setModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    reset({
      type: "expense",
      date: new Date().toISOString().split('T')[0],
      amount: undefined,
      description: "",
      category_id: categories.length > 0 ? categories[0].id : "",
      recurrence: "none",
    });
    setEditingId(null);
  };

  const handleEdit = (tx: any) => {
    setEditingId(tx.id);
    reset({
      type: tx.type,
      date: tx.date,
      amount: tx.amount,
      description: tx.description,
      category_id: tx.category_id,
      recurrence: tx.recurrence || "none",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction.mutateAsync(id);
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Recurrence'];
    const rows = transactions.map((t: any) => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.categories?.name || 'Other',
      t.type,
      t.amount,
      t.recurrence || 'none'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const allCategories = useMemo(() => ["All", ...categories.map(c => c.name)], [categories]);
  const net = transactions.reduce((s, tx) => tx.type === 'income' ? s + tx.amount : s - tx.amount, 0);

  const typePills: { label: string; value: TypeFilter }[] = [
    { label: "All", value: "all" },
    { label: "Income", value: "income" },
    { label: "Expense", value: "expense" },
  ];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (isLoading) {
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

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <p className="font-mono-dm text-[11px] uppercase tracking-[0.2em] text-primary mb-1">
            {format(new Date(), 'MMMM yyyy')}
          </p>
          <h1 className="font-display text-3xl text-foreground">Transactions</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            Export CSV
          </Button>
          <Dialog open={modalOpen} onOpenChange={(o) => { 
            setModalOpen(o); 
            if (!o) resetForm(); 
            else if (!editingId && categories.length > 0 && !watch("category_id")) {
               setValue("category_id", categories[0].id);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-foreground">
                  {editingId ? "Edit Transaction" : "New Transaction"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setValue("type", "expense")}
                    className={cn(
                      "flex-1 py-2.5 text-sm font-medium transition-colors",
                      formType === "expense" ? "bg-expense/15 text-expense" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("type", "income")}
                    className={cn(
                      "flex-1 py-2.5 text-sm font-medium transition-colors",
                      formType === "income" ? "bg-income/15 text-income" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Income
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Amount (THB)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    {...register("amount")}
                    className="font-mono-dm text-2xl h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground"
                  />
                  {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Category</label>
                  <Controller
                    name="category_id"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-muted border-border text-foreground">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {categories.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Description</label>
                  <Input
                    placeholder="What was this for?"
                    {...register("description")}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Date</label>
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => {
                      const dateValue = field.value ? new Date(field.value) : undefined;
                      return (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-muted border-border", !field.value && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateValue ? format(dateValue, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                            <Calendar 
                              mode="single" 
                              selected={dateValue} 
                              onSelect={(d) => d && field.onChange(format(d, 'yyyy-MM-dd'))} 
                              initialFocus 
                              className={cn("p-3 pointer-events-auto")} 
                            />
                          </PopoverContent>
                        </Popover>
                      );
                    }}
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Recurrence</label>
                  <Controller
                    name="recurrence"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-muted border-border text-foreground">
                          <SelectValue placeholder="Select recurrence" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.recurrence && <p className="text-red-500 text-xs mt-1">{errors.recurrence.message}</p>}
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2" 
                  disabled={addTransaction.isPending || updateTransaction.isPending}
                >
                  {addTransaction.isPending || updateTransaction.isPending ? "Saving…" : "Save Transaction"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
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

      <div className="flex items-center justify-between px-1 mb-3">
        <span className="font-mono-dm text-xs text-muted-foreground">
          {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
        </span>
        <span className={cn("font-mono-dm text-xs font-medium", net >= 0 ? "text-income" : "text-expense")}>
          Net: {net >= 0 ? "+" : "−"}{Math.abs(net).toLocaleString()} THB
        </span>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((tx) => {
              const categoryName = tx.categories?.name || "Other";
              const meta = categoryColors[categoryName] || categoryColors.Other;
              const isIncome = tx.type === "income";
              return (
                <div
                  key={tx.id}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white", meta.bg)}>
                    {categoryName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate flex items-center gap-2">
                      {tx.description}
                      {tx.recurrence && tx.recurrence !== 'none' && (
                        <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                          {tx.recurrence}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px]">
                      <span className={meta.text}>{categoryName}</span>
                      <span className="text-muted-foreground"> · </span>
                      <span className="font-mono-dm text-muted-foreground">{formatDate(tx.date)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("font-mono-dm text-sm font-medium", isIncome ? "text-income" : "text-expense")}>
                      {isIncome ? "+" : "−"}{Math.abs(tx.amount).toLocaleString()}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => handleEdit(tx)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        className="rounded p-1.5 text-muted-foreground hover:text-expense hover:bg-muted"
                        onClick={() => handleDelete(tx.id)}
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
