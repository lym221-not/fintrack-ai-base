import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";

const summaryCards = [
  { label: "Total Balance", value: "$24,563.00", icon: Wallet, change: "+2.5%", positive: true },
  { label: "Income", value: "$8,350.00", icon: TrendingUp, change: "+12.3%", positive: true },
  { label: "Expenses", value: "$3,820.00", icon: TrendingDown, change: "-4.1%", positive: false },
  { label: "Savings Rate", value: "54.2%", icon: PiggyBank, change: "+8.7%", positive: true },
];

const Index = () => {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back, John</p>
        </div>
        <div className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground">
          Mar 1 – Mar 19, 2026
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="font-mono-dm text-2xl font-medium text-foreground">{card.value}</p>
            <span
              className={`mt-1 inline-block text-xs font-medium ${
                card.positive ? "text-income" : "text-expense"
              }`}
            >
              {card.change} from last month
            </span>
          </div>
        ))}
      </div>

      {/* Placeholder content area */}
      <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="col-span-2 flex h-64 items-center justify-center rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">Spending chart coming soon</p>
        </div>
        <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">Recent transactions</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
