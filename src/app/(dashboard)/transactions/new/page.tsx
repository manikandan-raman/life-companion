"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { TransactionForm } from "@/components/finance/transaction-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateTransaction, type TransactionFormValues } from "@/hooks/use-transactions";

export default function NewTransactionPage() {
  const router = useRouter();
  const createTransaction = useCreateTransaction();

  const handleSubmit = async (data: TransactionFormValues) => {
    try {
      await createTransaction.mutateAsync(data);
      toast.success("Transaction created successfully");
      router.push("/transactions");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create transaction"
      );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-4 px-4 py-3 md:px-6 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">New Transaction</h1>
      </header>

      <div className="px-4 py-6 md:px-6 max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm
              onSubmit={handleSubmit}
              isSubmitting={createTransaction.isPending}
              submitLabel="Create Transaction"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
