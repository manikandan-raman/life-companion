"use client";

import Link from "next/link";
import { Camera, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { NetWorthChart } from "@/components/finance/networth-chart";
import { NetWorthBreakdown } from "@/components/finance/networth-breakdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNetWorth,
  useNetWorthHistory,
  useCreateSnapshot,
} from "@/hooks/use-networth";

export default function NetWorthPage() {
  const { data: netWorth, isLoading: isLoadingNetWorth } = useNetWorth();
  const { data: history, isLoading: isLoadingHistory } = useNetWorthHistory(12);
  const createSnapshot = useCreateSnapshot();

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCreateSnapshot = async () => {
    try {
      await createSnapshot.mutateAsync();
      toast.success("Snapshot created successfully");
    } catch (error) {
      toast.error("Failed to create snapshot");
    }
  };

  const isLoading = isLoadingNetWorth || isLoadingHistory;

  return (
    <div className="min-h-screen">
      <Header title="Net Worth" />

      <div className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Net Worth Summary */}
        {isLoading ? (
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
            <CardContent className="py-8">
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-12 w-64 mx-auto" />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Your Net Worth
              </p>
              <p
                className={`text-4xl font-bold ${
                  (netWorth?.netWorth || 0) >= 0
                    ? "text-blue-600"
                    : "text-red-500"
                }`}
              >
                {formatAmount(netWorth?.netWorth || 0)}
              </p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">
                    Assets: {formatAmount(netWorth?.totalAssets || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-red-500">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm">
                    Liabilities: {formatAmount(netWorth?.totalLiabilities || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/assets">
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Manage Assets
            </Button>
          </Link>
          <Link href="/liabilities">
            <Button variant="outline" size="sm">
              <TrendingDown className="h-4 w-4 mr-2" />
              Manage Liabilities
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateSnapshot}
            disabled={createSnapshot.isPending}
          >
            {createSnapshot.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Camera className="h-4 w-4 mr-2" />
            )}
            Save Snapshot
          </Button>
        </div>

        {/* Net Worth Trend Chart */}
        <NetWorthChart data={history || []} isLoading={isLoadingHistory} />

        {/* Breakdown */}
        <NetWorthBreakdown data={netWorth || null} isLoading={isLoadingNetWorth} />

        {/* Quick Stats */}
        {!isLoading && netWorth && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground">Bank & Cash</p>
                <p className="text-lg font-semibold text-emerald-600">
                  {formatAmount(
                    (netWorth.breakdown?.bankAccounts || 0) +
                      (netWorth.breakdown?.cash || 0)
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground">Investments</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatAmount(netWorth.breakdown?.investments || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground">Fixed Deposits</p>
                <p className="text-lg font-semibold text-cyan-600">
                  {formatAmount(netWorth.breakdown?.fixedDeposits || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground">Retirement</p>
                <p className="text-lg font-semibold text-indigo-600">
                  {formatAmount(netWorth.breakdown?.retirement || 0)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

