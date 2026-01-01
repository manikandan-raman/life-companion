"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Zap,
  Tv,
  Home,
  Shield,
  CreditCard,
  Receipt,
  MoreVertical,
  Check,
  AlertCircle,
  Clock,
  Calendar,
  ShoppingCart,
  Car,
  Heart,
  Film,
  ShoppingBag,
  MoreHorizontal,
  Circle,
  Briefcase,
  Gift,
  TrendingUp,
  PlusCircle,
  PiggyBank,
  Landmark,
  BarChart,
  Lock,
  LifeBuoy,
} from "lucide-react";
import type { BillStatus } from "@/types";
import type { RecurringBillWithRelations } from "@/hooks/use-bills";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  tv: Tv,
  home: Home,
  shield: Shield,
  "credit-card": CreditCard,
  receipt: Receipt,
  "shopping-cart": ShoppingCart,
  car: Car,
  heart: Heart,
  film: Film,
  utensils: Receipt, // Use Receipt as fallback for utensils
  "shopping-bag": ShoppingBag,
  "more-horizontal": MoreHorizontal,
  circle: Circle,
  briefcase: Briefcase,
  gift: Gift,
  "trending-up": TrendingUp,
  "plus-circle": PlusCircle,
  "piggy-bank": PiggyBank,
  landmark: Landmark,
  "bar-chart": BarChart,
  lock: Lock,
  "life-buoy": LifeBuoy,
};

const statusConfig: Record<
  BillStatus,
  { label: string; variant: "default" | "destructive" | "secondary" | "outline"; icon: React.ComponentType<{ className?: string }> }
> = {
  paid: { label: "Paid", variant: "default", icon: Check },
  overdue: { label: "Overdue", variant: "destructive", icon: AlertCircle },
  due_today: { label: "Due Today", variant: "destructive", icon: Clock },
  upcoming: { label: "Upcoming", variant: "secondary", icon: Calendar },
  pending: { label: "Pending", variant: "outline", icon: Clock },
};

interface BillCardProps {
  bill: RecurringBillWithRelations;
  onEdit?: () => void;
  onDelete?: () => void;
  onMarkAsPaid?: () => void;
  className?: string;
}

export function BillCard({
  bill,
  onEdit,
  onDelete,
  onMarkAsPaid,
  className,
}: BillCardProps) {
  const formatAmount = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const status = statusConfig[bill.status];
  const StatusIcon = status.icon;
  
  // Use category icon/color, fallback to receipt icon
  const categoryIcon = bill.category?.icon || "receipt";
  const categoryColor = bill.category?.color || "#6366f1";
  const BillIcon = iconMap[categoryIcon] || Receipt;

  const getDueText = () => {
    const day = bill.dueDay;
    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
        ? "rd"
        : "th";
    return `Due on ${day}${suffix}`;
  };

  return (
    <Card
      className={cn(
        "border-border/50 transition-all hover:shadow-md",
        bill.status === "overdue" && "border-destructive/50",
        bill.status === "due_today" && "border-orange-500/50",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Icon and Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
              style={{
                backgroundColor: `${categoryColor}20`,
              }}
            >
              <span style={{ color: categoryColor }}>
                <BillIcon className="h-5 w-5" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium truncate">{bill.name}</h3>
                <Badge variant={status.variant} className="text-xs py-0 h-5 gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                {bill.category && (
                  <span className="truncate">{bill.category.name}</span>
                )}
                {bill.category && <span>•</span>}
                <span>{getDueText()}</span>
              </div>
            </div>
          </div>

          {/* Amount and Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <p
                className={cn(
                  "font-semibold text-lg",
                  bill.status === "paid" && "text-muted-foreground line-through",
                  bill.status === "overdue" && "text-destructive"
                )}
              >
                {formatAmount(bill.amount)}
              </p>
              {bill.payment?.paidDate && (
                <p className="text-xs text-muted-foreground">
                  Paid {new Date(bill.payment.paidDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {bill.status !== "paid" && (
                  <DropdownMenuItem onClick={onMarkAsPaid}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Account info */}
        {bill.account && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
            <span>Pay from: {bill.account.name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
