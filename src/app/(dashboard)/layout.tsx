import { type ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SideRail } from "@/components/layout/side-rail";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop side rail */}
      <SideRail />
      
      {/* Main content */}
      <main className="md:pl-64 pb-28 md:pb-0">
        {children}
      </main>
      
      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}

