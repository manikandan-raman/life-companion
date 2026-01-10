"use client";

import { cn } from "@/lib/utils";
import { DEFAULT_COLORS } from "@/lib/colors";
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
  Wallet,
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
  utensils: Receipt,
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
  {
    label: string;
    variant: "default" | "destructive" | "secondary" | "outline";
    icon: React.ComponentType<{ className?: string }>;
  }
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

  // Use category icon, fallback to receipt icon
  const categoryIcon = bill.category?.icon || "receipt";
  const categoryColor = DEFAULT_COLORS.bill;
  const BillIcon =
    iconMap[categoryIcon.toLowerCase()] || iconMap[categoryIcon] || Receipt;

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
    return `${day}${suffix}`;
  };

  return (
    <Card
      className={cn(
        "border-border/50 transition-all hover:shadow-md overflow-hidden py-0 gap-0",
        bill.status === "overdue" && "border-destructive/50",
        bill.status === "due_today" && "border-orange-500/50",
        className
      )}
    >
      <CardContent className="p-4">
        {/* Main content row - fixed grid layout */}
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
            style={{
              backgroundColor: `${categoryColor}15`,
            }}
          >
            <span style={{ color: categoryColor }}>
              <BillIcon className="h-5 w-5" />
            </span>
          </div>

          {/* Info section - fixed width with truncation */}
          <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 items-center">
            {/* Row 1: Name + Badge | Amount */}
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-semibold text-sm truncate max-w-[120px] md:max-w-[200px] lg:max-w-none">
                {bill.name}
              </h3>
              <Badge
                variant={status.variant}
                className="text-[10px] px-1.5 py-0 h-[18px] gap-0.5 shrink-0"
              >
                <StatusIcon className="h-2.5 w-2.5" />
                {status.label}
              </Badge>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "font-bold text-base tabular-nums",
                  bill.status === "paid" &&
                    "text-muted-foreground line-through",
                  bill.status === "overdue" && "text-destructive"
                )}
              >
                {formatAmount(bill.amount)}
              </p>
            </div>

            {/* Row 2: Category + Due | Paid date */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {bill.category && (
                <>
                  <span className="truncate max-w-[80px] md:max-w-[150px]">
                    {bill.category.name}
                  </span>
                  <span className="text-border">•</span>
                </>
              )}
              <span className="whitespace-nowrap">Due on {getDueText()}</span>
            </div>
            <div className="text-right">
              {bill.payment?.paidDate ? (
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  Paid{" "}
                  {new Date(bill.payment.paidDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              ) : (
                <div className="h-4" /> // Placeholder to maintain height
              )}
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 -mr-1"
              >
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

        {/* Account info footer */}
        {bill.account && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" />
            <span className="truncate">Pay from: {bill.account.name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
