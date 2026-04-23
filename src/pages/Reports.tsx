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
    </div>
  );
};

export default Reports;
