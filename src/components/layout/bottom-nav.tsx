"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowUpDown,
  Wallet,
  PieChart,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    href: "/networth",
    label: "Net Worth",
    icon: PieChart,
  },
  {
    href: "/accounts",
    label: "Accounts",
    icon: Wallet,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
      
      {/* Navigation items */}
      <div className="relative flex items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-3 px-4 min-w-[64px] transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

