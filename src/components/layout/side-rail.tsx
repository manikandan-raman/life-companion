"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowUpDown,
  Receipt,
  Wallet,
  PieChart,
  TrendingUp,
  TrendingDown,
  Tag,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: ArrowUpDown,
  },
  {
    href: "/bills",
    label: "Bills",
    icon: Receipt,
  },
  {
    href: "/accounts",
    label: "Accounts",
    icon: Wallet,
  },
  {
    href: "/networth",
    label: "Net Worth",
    icon: PieChart,
  },
  {
    href: "/assets",
    label: "Assets",
    icon: TrendingUp,
  },
  {
    href: "/liabilities",
    label: "Liabilities",
    icon: TrendingDown,
  },
  {
    href: "/categories",
    label: "Categories",
    icon: Tag,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function SideRail() {
  const pathname = usePathname();
  const { user, logout, isLoggingOut } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5 text-primary"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v2" />
            <path d="M12 16v2" />
            <path d="M14.5 8H11a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9.5" />
          </svg>
        </div>
        <div>
          <h1 className="font-semibold text-sidebar-foreground">Life Manager</h1>
          <p className="text-xs text-muted-foreground">Finance Module</p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-primary" : "text-sidebar-foreground/50"
                )}
              />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <ChevronRight className="h-4 w-4 ml-auto text-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User section */}
      <div className="p-4">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-sidebar-foreground">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => logout()}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

