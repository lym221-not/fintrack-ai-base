<<<<<<< HEAD
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReportData } from "@/hooks/useReports";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Reports = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const { data, isLoading } = useReportData(month, year);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4">
        <div className="animate-pulse bg-muted rounded h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="animate-pulse bg-card rounded-xl h-[400px]" />
          <div className="animate-pulse bg-card rounded-xl h-[400px]" />
        </div>
      </div>
    );
  }

  const hasData = data?.categoryData && data.categoryData.length > 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="text-primary font-mono-dm tracking-widest text-xs uppercase mb-1">
            Analytics
          </div>
          <h1 className="font-display text-3xl text-foreground">Reports</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
            <SelectTrigger className="w-[140px] bg-card">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={m} value={(i + 1).toString()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-[100px] bg-card">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!hasData ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <div className="font-semibold text-foreground mb-1">
            No expenses found
          </div>
          <p className="text-muted-foreground text-sm max-w-xs">
            There are no expenses recorded for this month. Add some transactions to see your reports.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Expenses by Category</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString()} THB`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.categoryData.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm truncate text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Bar Chart */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Spending Breakdown</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `${val}`} />
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString()} THB`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)' }}
                    cursor={{ fill: 'var(--muted)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
=======
import { Card } from "@/components/ui/card";

const Reports = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-primary font-mono-dm tracking-widest text-xs uppercase mb-1">
          PHASE 3 — STEP 8
        </div>
        <h1 className="font-display text-3xl text-foreground">Reports</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Charts, monthly summaries, and spending trends will live here.
        </p>
      </div>

      {/* Centered Card */}
      <Card className="p-12 flex flex-col items-center justify-center text-center">
        {/* Icon Container */}
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <svg 
            className="w-7 h-7 text-primary" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" 
            />
          </svg>
        </div>

        {/* Text Content */}
        <div className="font-semibold text-foreground mb-1">
          Coming in Phase 3
        </div>
        <p className="text-muted-foreground text-sm max-w-xs">
          Category breakdowns, month-over-month comparisons, and spending trend charts.
        </p>
      </Card>
>>>>>>> 357fedc7adf103e8cd91392693ff036becb71690
    </div>
  );
};

export default Reports;
