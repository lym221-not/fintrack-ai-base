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
} from "lucide-react";
import { Link } from "react-router-dom";

/* ── Mock Data ── */
const stats = [
  { label: "Current Balance", value: "82,450", trend: "+12.4%", positive: true, accent: true, icon: Wallet },
  { label: "Total Income", value: "125,000", trend: "+8.2%", positive: true, accent: false, icon: TrendingUp },
  { label: "Total Expenses", value: "42,550", trend: "-3.1%", positive: false, accent: false, icon: TrendingDown },
];

const categoryMeta: Record<string, { icon: React.ElementType; bg: string; text: string }> = {
  Food: { icon: UtensilsCrossed, bg: "bg-orange-500/20", text: "text-orange-400" },
  Income: { icon: Briefcase, bg: "bg-primary/20", text: "text-primary" },
  Transport: { icon: Car, bg: "bg-blue/20", text: "text-blue" },
  Shopping: { icon: ShoppingBag, bg: "bg-purple-500/20", text: "text-purple-400" },
  Health: { icon: Heart, bg: "bg-rose-500/20", text: "text-rose-400" },
};

const transactions = [
  { amount: -350, category: "Food", desc: "Lunch – MBK Food Court", date: "Mar 18" },
  { amount: 125000, category: "Income", desc: "March salary", date: "Mar 15" },
  { amount: -1200, category: "Transport", desc: "Grab commute", date: "Mar 17" },
  { amount: -2800, category: "Shopping", desc: "Big C groceries", date: "Mar 16" },
];

const budgets = [
  { category: "Food", spent: 3200, limit: 5000 },
  { category: "Transport", spent: 2100, limit: 2500 },
  { category: "Shopping", spent: 4800, limit: 4000 },
  { category: "Health", spent: 500, limit: 3000 },
];

function budgetBarColor(spent: number, limit: number) {
  const ratio = spent / limit;
  if (ratio > 1) return "bg-expense";
  if (ratio > 0.75) return "bg-amber";
  return "bg-primary";
}

const Index = () => {
  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      {/* Header */}
      <p className="font-mono-dm text-[11px] uppercase tracking-[0.2em] text-primary mb-1">
        March 2026
      </p>
      <h1 className="font-display text-3xl text-foreground mb-8">Overview</h1>

      {/* Section 1 — Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`relative rounded-xl border bg-card p-5 transition-colors ${
              s.accent
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

      {/* Section 2 — Two columns */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-8">
        {/* Recent Transactions */}
        <div className="xl:col-span-3 rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-lg text-foreground mb-4">Recent Transactions</h2>
          <div className="space-y-1">
            {transactions.map((tx, i) => {
              const meta = categoryMeta[tx.category];
              const Icon = meta.icon;
              const isIncome = tx.amount > 0;
              return (
                <div
                  key={i}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 -mx-3 transition-colors hover:bg-muted/50"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
                    <Icon className={`h-4 w-4 ${meta.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{tx.desc}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {tx.category} · {tx.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono-dm text-sm font-medium ${isIncome ? "text-income" : "text-expense"}`}
                    >
                      {isIncome ? "+" : "-"}
                      {Math.abs(tx.amount).toLocaleString()}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted">
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button className="rounded p-1 text-muted-foreground hover:text-expense hover:bg-muted">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            to="/transactions"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all transactions <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Budgets */}
        <div className="xl:col-span-2 rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-lg text-foreground mb-4">Budgets</h2>
          <div className="space-y-4">
            {budgets.map((b) => {
              const pct = Math.min((b.spent / b.limit) * 100, 100);
              const over = b.spent > b.limit;
              return (
                <div key={b.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-foreground">{b.category}</span>
                    <span className="font-mono-dm text-xs text-muted-foreground">
                      {b.spent.toLocaleString()}{" "}
                      <span className="text-muted-foreground/60">/ {b.limit.toLocaleString()} THB</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${budgetBarColor(b.spent, b.limit)}`}
                      style={{ width: `${over ? 100 : pct}%` }}
                    />
                  </div>
                  {over && (
                    <p className="mt-1 text-[10px] font-medium text-expense">
                      Over budget by {(b.spent - b.limit).toLocaleString()} THB
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <Link
            to="/settings"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Manage budgets <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Section 3 — Telegram CTA */}
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
