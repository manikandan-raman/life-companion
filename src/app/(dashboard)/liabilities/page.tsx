"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { LiabilityCard } from "@/components/finance/liability-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useLiabilities,
  useCreateLiability,
  useDeleteLiability,
  useAddLiabilityPayment,
} from "@/hooks/use-liabilities";
import { liabilitySchema } from "@/schemas/liability";
import { cn } from "@/lib/utils";
import type { LiabilityType } from "@/types";

interface FormValues {
  name: string;
  type: LiabilityType;
  principalAmount: number;
  outstandingBalance: number;
  interestRate: number;
  emiAmount?: number | null;
  startDate: Date;
  endDate?: Date | null;
  notes?: string | null;
  color: string;
}

const colorOptions = [
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ec4899", label: "Pink" },
  { value: "#8b5cf6", label: "Violet" },
];

const typeOptions: { value: LiabilityType; label: string }[] = [
  { value: "home_loan", label: "Home Loan" },
  { value: "personal_loan", label: "Personal Loan" },
  { value: "other", label: "Other Loan" },
];

export default function LiabilitiesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedLiabilityId, setSelectedLiabilityId] = useState<string | null>(
    null
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [principalPaid, setPrincipalPaid] = useState("");

  const { data: liabilities, isLoading } = useLiabilities();
  const createLiability = useCreateLiability();
  const deleteLiability = useDeleteLiability();
  const addPayment = useAddLiabilityPayment();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(liabilitySchema) as never,
    defaultValues: {
      name: "",
      type: "personal_loan",
      principalAmount: undefined,
      outstandingBalance: undefined,
      interestRate: 10,
      color: "#ef4444",
      startDate: new Date(),
    },
  });

  const selectedColor = watch("color");
  const selectedType = watch("type");

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await createLiability.mutateAsync(data);
      toast.success("Liability created successfully");
      reset();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create liability"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this liability?")) return;

    try {
      await deleteLiability.mutateAsync(id);
      toast.success("Liability deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete liability"
      );
    }
  };

  const handleAddPayment = async () => {
    if (!selectedLiabilityId || !paymentAmount) return;

    try {
      await addPayment.mutateAsync({
        liabilityId: selectedLiabilityId,
        data: {
          amount: parseFloat(paymentAmount),
          principalPaid: principalPaid ? parseFloat(principalPaid) : undefined,
          paymentDate: new Date(),
        },
      });
      toast.success("Payment recorded successfully");
      setIsPaymentDialogOpen(false);
      setSelectedLiabilityId(null);
      setPaymentAmount("");
      setPrincipalPaid("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to record payment"
      );
    }
  };

  // Calculate totals
  const totalOutstanding =
    liabilities?.reduce(
      (sum, liability) =>
        sum + parseFloat(String(liability.outstandingBalance)),
      0
    ) || 0;
  const totalPrincipal =
    liabilities?.reduce(
      (sum, liability) => sum + parseFloat(String(liability.principalAmount)),
      0
    ) || 0;
  const totalPaid = totalPrincipal - totalOutstanding;
  const progressPercentage =
    totalPrincipal > 0 ? ((totalPaid / totalPrincipal) * 100).toFixed(1) : "0.0";

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen">
      <Header title="Liabilities" />

      <div className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Total Liability Summary */}
        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Total Outstanding
            </p>
            <p className="text-3xl font-bold text-red-500">
              {formatAmount(totalOutstanding)}
            </p>
            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>Paid: {formatAmount(totalPaid)}</span>
              <span>•</span>
              <span>{progressPercentage}% completed</span>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Your Loans</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Loan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Loan</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4 mt-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Loan Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Home Loan - SBI"
                      {...register("name")}
                      className={cn(errors.name && "border-destructive")}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Loan Type</Label>
                    <Select
                      value={selectedType}
                      onValueChange={(v) => setValue("type", v as LiabilityType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="principalAmount">Principal Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ₹
                        </span>
                        <Input
                          id="principalAmount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-8"
                          {...register("principalAmount", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outstandingBalance">
                        Outstanding Balance
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ₹
                        </span>
                        <Input
                          id="outstandingBalance"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-8"
                          {...register("outstandingBalance", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.01"
                        placeholder="10.5"
                        {...register("interestRate", { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emiAmount">EMI Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ₹
                        </span>
                        <Input
                          id="emiAmount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-8"
                          {...register("emiAmount", { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register("startDate", { valueAsDate: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setValue("color", color.value)}
                          className={cn(
                            "w-8 h-8 rounded-full transition-transform",
                            selectedColor === color.value &&
                              "ring-2 ring-offset-2 ring-primary scale-110"
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createLiability.isPending}
                  >
                    {createLiability.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Loan"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : liabilities?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No loans recorded. Add your home loan, personal loan, or other
                  liabilities.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Loan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {liabilities?.map((liability) => (
                <LiabilityCard
                  key={liability.id}
                  liability={liability}
                  onDelete={() => handleDelete(liability.id)}
                  onAddPayment={() => {
                    setSelectedLiabilityId(liability.id);
                    setPaymentAmount(String(liability.emiAmount || ""));
                    setIsPaymentDialogOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Payment Dialog */}
        <Dialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="principalPaid">Principal Paid (optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="principalPaid"
                    type="number"
                    step="0.01"
                    value={principalPaid}
                    onChange={(e) => setPrincipalPaid(e.target.value)}
                    className="pl-8"
                    placeholder="Leave blank if unknown"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  If provided, this will reduce the outstanding balance
                </p>
              </div>
              <Button
                className="w-full"
                onClick={handleAddPayment}
                disabled={addPayment.isPending}
              >
                {addPayment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Record Payment"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

