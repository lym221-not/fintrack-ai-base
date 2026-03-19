import { DollarSign, LayoutDashboard, ArrowLeftRight, BarChart3, Settings, Send } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <DollarSign className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-lg leading-tight text-foreground">FinTrack</h1>
          <span className="font-mono-dm text-xs text-primary">AI Edition</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                end={item.url === "/"}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeClassName="!bg-primary !text-primary-foreground"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Telegram Status */}
      <div className="mx-3 mb-3 rounded-lg border border-border bg-muted p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-amber animate-pulse-dot" />
          </span>
          <span className="text-xs text-muted-foreground">Not connected</span>
        </div>
        <button className="flex w-full items-center justify-center gap-2 rounded-md bg-blue px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-blue/80">
          <Send className="h-3 w-3" />
          Connect Sync
        </button>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 border-t border-border px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
          JD
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm text-foreground">john@example.com</p>
          <p className="text-xs text-muted-foreground">Pro Plan</p>
        </div>
      </div>
    </aside>
  );
}
