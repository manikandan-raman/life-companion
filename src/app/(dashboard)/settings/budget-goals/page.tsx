"use client";

import { useEffect, useState } from "react";
import { RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { useBudgetGoal, useUpdateBudgetGoal, useResetBudgetGoal } from "@/hooks/use-budget-goals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonthPicker } from "@/components/finance/month-picker";
import { toast } from "sonner";

export default function BudgetGoalsPage() {
  // Budget goals state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedMonth = selectedDate.getMonth() + 1;
  const selectedYear = selectedDate.getFullYear();
  
  const { data: budgetGoal, isLoading: isLoadingGoal } = useBudgetGoal(selectedMonth, selectedYear);
  const updateBudgetGoal = useUpdateBudgetGoal();
  const resetBudgetGoal = useResetBudgetGoal();
  
  // Local form state for budget percentages
  const [needsPercentage, setNeedsPercentage] = useState(50);
  const [wantsPercentage, setWantsPercentage] = useState(30);
  const [savingsPercentage, setSavingsPercentage] = useState(20);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Sync form state with fetched data
  useEffect(() => {
    if (budgetGoal) {
      setNeedsPercentage(budgetGoal.needsPercentage);
      setWantsPercentage(budgetGoal.wantsPercentage);
      setSavingsPercentage(budgetGoal.savingsPercentage);
      setHasChanges(false);
    }
  }, [budgetGoal]);
  
  // Track changes
  useEffect(() => {
    if (budgetGoal) {
      const changed = 
        needsPercentage !== budgetGoal.needsPercentage ||
        wantsPercentage !== budgetGoal.wantsPercentage ||
        savingsPercentage !== budgetGoal.savingsPercentage;
      setHasChanges(changed);
    }
  }, [needsPercentage, wantsPercentage, savingsPercentage, budgetGoal]);
  
  // Calculate total and check if valid
  const total = needsPercentage + wantsPercentage + savingsPercentage;
  const isValidTotal = Math.abs(total - 100) < 0.01;
    
  const handleSaveBudgetGoal = async () => {
    if (!isValidTotal) {
      toast.error("Percentages must add up to 100%");
      return;
    }
    
    try {
      await updateBudgetGoal.mutateAsync({
        month: selectedMonth,
        year: selectedYear,
        needsPercentage,
        wantsPercentage,
        savingsPercentage,
      });
      toast.success("Budget goal saved successfully");
    } catch {
      toast.error("Failed to save budget goal");
    }
  };
  
  const handleResetToDefaults = async () => {
    try {
      await resetBudgetGoal.mutateAsync({
        month: selectedMonth,
        year: selectedYear,
      });
      setNeedsPercentage(50);
      setWantsPercentage(30);
      setSavingsPercentage(20);
      toast.success("Budget goal reset to defaults");
    } catch {
      toast.error("Failed to reset budget goal");
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Budget Goals" 
        leftAction={
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        }
      />

      <div className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              The 50/30/20 rule suggests allocating 50% of income to needs, 30% to wants, 
              and 20% to savings. Customize these percentages for any month to match your financial goals.
            </p>
          </CardContent>
        </Card>

        {/* Month Picker */}
        <div className="flex items-center justify-center">
          <MonthPicker 
            value={selectedDate} 
            onChange={setSelectedDate}
            monthsToShow={12}
            futureMonths={6}
          />
        </div>

        {/* Budget Goals Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Budget Allocation</CardTitle>
                <CardDescription>
                  Set your target percentages for this month
                </CardDescription>
              </div>
              {/* Status indicator */}
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${budgetGoal?.isCustom ? 'bg-primary' : 'bg-muted-foreground'}`} />
                <span className="text-muted-foreground hidden sm:inline">
                  {budgetGoal?.isCustom 
                    ? 'Custom' 
                    : 'Default'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingGoal ? (
              <div className="space-y-4">
                <div className="h-20 bg-muted animate-pulse rounded-xl" />
                <div className="h-20 bg-muted animate-pulse rounded-xl" />
                <div className="h-20 bg-muted animate-pulse rounded-xl" />
              </div>
            ) : (
              <>
                {/* Percentage inputs - card style */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="needs" className="text-base font-semibold text-blue-400">
                          Needs
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Essential expenses like rent, groceries, utilities</p>
                      </div>
                      <div className="relative w-24">
                        <Input
                          id="needs"
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={needsPercentage}
                          onChange={(e) => setNeedsPercentage(Number(e.target.value))}
                          className="pr-8 text-right text-lg font-bold h-12 bg-background/50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="wants" className="text-base font-semibold text-purple-400">
                          Wants
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Non-essential like dining out, entertainment, shopping</p>
                      </div>
                      <div className="relative w-24">
                        <Input
                          id="wants"
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={wantsPercentage}
                          onChange={(e) => setWantsPercentage(Number(e.target.value))}
                          className="pr-8 text-right text-lg font-bold h-12 bg-background/50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="savings" className="text-base font-semibold text-emerald-400">
                          Savings & Investments
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Emergency fund, retirement, investments</p>
                      </div>
                      <div className="relative w-24">
                        <Input
                          id="savings"
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={savingsPercentage}
                          onChange={(e) => setSavingsPercentage(Number(e.target.value))}
                          className="pr-8 text-right text-lg font-bold h-12 bg-background/50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Total indicator */}
                <div className={`flex items-center justify-between p-4 rounded-xl ${isValidTotal ? 'bg-muted' : 'bg-destructive/10 border border-destructive/20'}`}>
                  <span className="text-base font-semibold">Total</span>
                  <span className={`text-xl font-bold ${isValidTotal ? 'text-primary' : 'text-destructive'}`}>
                    {total.toFixed(0)}%
                    {!isValidTotal && <span className="ml-2 text-sm font-normal">(must equal 100%)</span>}
                  </span>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <Button 
                    onClick={handleSaveBudgetGoal}
                    disabled={!hasChanges || !isValidTotal || updateBudgetGoal.isPending}
                    className="w-full sm:flex-1 h-12"
                    size="lg"
                  >
                    {updateBudgetGoal.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  
                  {budgetGoal?.isCustom && (
                    <Button 
                      variant="outline"
                      onClick={handleResetToDefaults}
                      disabled={resetBudgetGoal.isPending}
                      className="w-full sm:w-auto h-12"
                      size="lg"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset to Defaults
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

