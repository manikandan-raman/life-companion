"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted">
          <WifiOff className="w-10 h-10 text-muted-foreground" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">You&apos;re Offline</h1>
          <p className="text-muted-foreground">
            It looks like you&apos;ve lost your internet connection. Please check your
            network settings and try again.
          </p>
        </div>

        {/* Action */}
        <Button onClick={() => window.location.reload()} className="w-full">
          Try Again
        </Button>

        {/* Info */}
        <p className="text-sm text-muted-foreground">
          Some features may be available offline. Your data will sync when you&apos;re
          back online.
        </p>
      </div>
    </div>
  );
}

