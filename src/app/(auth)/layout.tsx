import { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      {/* Background gradient effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-savings/10 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-8 h-8 text-primary"
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
          <h1 className="text-2xl font-bold tracking-tight">Life Manager</h1>
          <p className="text-muted-foreground text-sm">
            Take control of your finances
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}

