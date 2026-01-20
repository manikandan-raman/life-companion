"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, Sun, Moon, FileText } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  action?: React.ReactNode;
  leftAction?: React.ReactNode;
  variant?: "default" | "greeting";
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Header({ title, action, leftAction, variant = "default" }: HeaderProps) {
  const { user, logout, isLoggingOut } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Hello");

  // Only compute greeting on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setGreeting(getGreeting());
  }, []);

  const currentTheme = mounted ? resolvedTheme : "dark";

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const firstName = user?.name?.split(" ")[0] || "there";

  // Greeting variant - more personal header
  if (variant === "greeting") {
    return (
      <header className="sticky top-0 z-40 px-4 py-4 md:px-6 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Greeting */}
          <div className="space-y-0.5">
            <p className="text-sm text-muted-foreground font-medium">
              {mounted ? greeting : "Hello"},
            </p>
            <h1 className="text-2xl font-bold tracking-tight">{firstName}</h1>
          </div>

          {/* Right side - theme toggle + avatar */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-muted/50 hover:bg-muted"
              onClick={toggleTheme}
            >
              {currentTheme === "dark" ? (
                <Sun className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>

            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 ring-2 ring-border/50">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/categories" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Categories
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/reports" className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    Reports
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    );
  }

  // Default variant
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 md:px-6 bg-background/80 backdrop-blur-xl border-b border-border/50">
      {/* Left side - back action + title */}
      <div className="flex items-center gap-2">
        {leftAction}
        <h1 className="text-lg font-semibold">{title || "Dashboard"}</h1>
      </div>

      {/* Right side - action + theme toggle + user menu */}
      <div className="flex items-center gap-2">
        {/* Action slot - Desktop */}
        {action && <div className="hidden md:block">{action}</div>}

        {/* Theme toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted"
          onClick={toggleTheme}
        >
          {currentTheme === "dark" ? (
            <Sun className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Moon className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>

        {/* Mobile: action + user menu */}
        <div className="flex md:hidden items-center gap-2">
          {action}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/categories" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Categories
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/reports" className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  Reports
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => logout()}
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
