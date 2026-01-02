"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Moon,
  Sun,
  LogOut,
  User,
  Bell,
  Shield,
  HelpCircle,
  Info,
  Target,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { user, logout, isLoggingOut } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show theme UI after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? resolvedTheme : "dark";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const menuItems = [
    {
      icon: Target,
      label: "Budget Goals",
      description: "Customize your 50/30/20 budget allocation",
      href: "/settings/budget-goals",
      highlight: true,
    },
    {
      icon: User,
      label: "Profile",
      description: "Manage your account details",
      href: "#",
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Configure notification preferences",
      href: "#",
    },
    {
      icon: Shield,
      label: "Privacy & Security",
      description: "Manage your privacy settings",
      href: "#",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get help or send feedback",
      href: "#",
    },
    {
      icon: Info,
      label: "About",
      description: "App version and information",
      href: "#",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header title="Settings" />

      <div className="p-4 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                  {currentTheme === "dark" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Currently using {currentTheme === "dark" ? "dark" : "light"}{" "}
                    theme
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={currentTheme === "light" ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={currentTheme === "dark" ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left ${
                    item.highlight ? "bg-primary/5" : ""
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                      item.highlight ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${
                        item.highlight
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        item.highlight ? "text-primary" : ""
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                {index < menuItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="border-destructive/20">
          <CardContent className="p-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => logout()}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </CardContent>
        </Card>

        {/* Version Info */}
        <p className="text-center text-sm text-muted-foreground">
          Life Manager v1.0.0
        </p>
      </div>
    </div>
  );
}
