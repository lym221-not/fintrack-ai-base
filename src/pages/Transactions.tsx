import { useState, useMemo } from "react";
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

const allCategories = ["All", "Food", "Transport", "Shopping", "Health", "Income", "Rent", "Travel", "Other"];

interface Transaction {
  id: number;
  amount: number;
  category: string;
  desc: string;
  date: string;
}

const mockTransactions: Transaction[] = [
  { id: 1, amount: -350, category: "Food", desc: "Lunch – MBK Food Court", date: "2026-03-18" },
  { id: 2, amount: 125000, category: "Income", desc: "March salary", date: "2026-03-15" },
  { id: 3, amount: -1200, category: "Transport", desc: "Grab commute", date: "2026-03-17" },
  { id: 4, amount: -2800, category: "Shopping", desc: "Big C groceries", date: "2026-03-16" },
];

type TypeFilter = "all" | "income" | "expense";

const Transactions = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);

  /* Modal form state */
  const [formType, setFormType] = useState<"expense" | "income">("expense");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("Food");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState<Date | undefined>(new Date());

  const filtered = useMemo(() => {
    return mockTransactions.filter((tx) => {
      if (typeFilter === "income" && tx.amount < 0) return false;
      if (typeFilter === "expense" && tx.amount > 0) return false;
      if (categoryFilter !== "All" && tx.category !== categoryFilter) return false;
      if (search && !tx.desc.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, typeFilter, categoryFilter]);

  const net = filtered.reduce((s, tx) => s + tx.amount, 0);

  const typePills: { label: string; value: TypeFilter }[] = [
    { label: "All", value: "all" },
    { label: "Income", value: "income" },
    { label: "Expense", value: "expense" },
  ];

  const resetForm = () => {
    setFormType("expense");
    setFormAmount("");
    setFormCategory("Food");
    setFormDesc("");
    setFormDate(new Date());
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

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
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {allCategories.filter((c) => c !== "All").map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
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
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2" onClick={() => setModalOpen(false)}>
              Save Transaction
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
      <div className="rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((tx) => {
              const meta = categoryColors[tx.category] ?? categoryColors.Other;
              const isIncome = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
                >
                  {/* Category square */}
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white", meta.bg)}>
                    {tx.category[0]}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{tx.desc}</p>
                    <p className="text-[11px]">
                      <span className={meta.text}>{tx.category}</span>
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
                      <button className="rounded p-1.5 text-muted-foreground hover:text-expense hover:bg-muted">
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
