"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  LayoutDashboard,
  ArrowUpDown,
  Receipt,
  Wallet,
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
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const activeIndex = useMemo(() => {
    return navItems.findIndex(
      (item) =>
        pathname === item.href ||
        (item.href !== "/" && pathname.startsWith(item.href))
    );
  }, [pathname]);

  return (
    <div
      className="fixed left-0 right-0 z-50 md:hidden px-3 pointer-events-none bottom-2"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Floating pill container */}
      <nav className="floating-glass-pill pointer-events-auto mx-auto max-w-[420px]">
        {/* Navigation items */}
        <div className="relative flex items-center justify-between py-1.5 px-1.5">
          {navItems.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-xl transition-all duration-200 active:scale-95 flex-1 min-w-0",
                  isActive ? "nav-item-active" : "hover:bg-foreground/5"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span
                  className={cn(
                    "text-[9px] font-medium transition-all duration-200 truncate",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
