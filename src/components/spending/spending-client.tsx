"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { startOfMonth, endOfMonth } from "date-fns";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  TrendingDown,
} from "lucide-react";
import { DonutChart } from "@tremor/react";
import { Header } from "@/components/layout/header";
import { MonthPicker } from "@/components/finance/month-picker";
import { TransactionCard } from "@/components/finance/transaction-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useSpendingBreakdown,
  type CategorySpending,
  type SubCategorySpending,
} from "@/hooks/use-spending-breakdown";
import {
  useGroupedTransactions,
  useSummary,
  type GroupedTransaction,
} from "@/hooks/use-transactions";
import { mapToTransactionWithRelations } from "@/lib/transaction-mappers";
import { CHART_COLORS, CHART_COLORS_HEX, ENTITY_COLORS } from "@/lib/colors";
import { iconMap } from "@/lib/icons";
import { cn } from "@/lib/utils";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

// Custom donut tooltip (mirrors the dashboard spending-breakdown card)
interface CustomTooltipProps {
  payload?: Array<{
    name: string;
    value: number;
    payload: { name: string; amount: number; fill?: string };
  }>;
  active?: boolean;
  colorMap: Record<string, string>;
}

function CustomTooltip({ payload, active, colorMap }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0];
  const name = data.payload.name;
  const value = data.value;
  const color = colorMap[name] || data.payload.fill || ENTITY_COLORS.gray.hex;

  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-popover-foreground">
          {name}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mt-1 pl-5">
        ₹{value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

export function SpendingClient() {
  const searchParams = useSearchParams();

  // Seed the month from URL (?month=1-12&year=YYYY), fall back to current month
  const initialDate = useMemo(() => {
    const monthParam = Number(searchParams.get("month"));
    const yearParam = Number(searchParams.get("year"));
    if (
      monthParam >= 1 &&
      monthParam <= 12 &&
      yearParam >= 1970 &&
      yearParam <= 9999
    ) {
      return new Date(yearParam, monthParam - 1, 1);
    }
    return new Date();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [currentDate, setCurrentDate] = useState(initialDate);
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  const { data: breakdown, isLoading: isLoadingBreakdown } =
    useSpendingBreakdown({ startDate, endDate });
  const { data: summary } = useSummary({ startDate, endDate });

  const categories = useMemo(
    () => breakdown?.categories ?? [],
    [breakdown]
  );
  const totalSpending = breakdown?.totalSpending || 0;

  // Donut data + color map
  const { chartData, colorMap, colors } = useMemo(() => {
    const data = categories.map((cat) => ({
      name: cat.name,
      amount: cat.amount,
    }));
    const colorMapObj: Record<string, string> = {};
    const colorList: string[] = [];
    data.forEach((item, index) => {
      colorMapObj[item.name] = CHART_COLORS_HEX[index % CHART_COLORS_HEX.length];
      colorList.push(CHART_COLORS[index % CHART_COLORS.length]);
    });
    return { chartData: data, colorMap: colorMapObj, colors: colorList };
  }, [categories]);

  // 50/30/20 split
  const split = useMemo(() => {
    const needs = summary?.needs.current || 0;
    const wants = summary?.wants.current || 0;
    const savings =
      (summary?.savings.current || 0) + (summary?.investments?.current || 0);
    const denom = needs + wants + savings;
    const pct = (v: number) => (denom > 0 ? Math.round((v / denom) * 100) : 0);
    return [
      { key: "needs", label: "Needs", amount: needs, percentage: pct(needs) },
      { key: "wants", label: "Wants", amount: wants, percentage: pct(wants) },
      {
        key: "savings",
        label: "Savings",
        amount: savings,
        percentage: pct(savings),
      },
    ];
  }, [summary]);

  return (
    <div className="min-h-screen">
      <Header
        title="Spending"
        leftAction={
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -ml-1 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      <div className="px-4 py-6 md:px-6 space-y-5 max-w-4xl mx-auto">
        {/* Month Picker */}
        <MonthPicker value={currentDate} onChange={setCurrentDate} />

        {isLoadingBreakdown ? (
          <>
            <Skeleton className="h-72 rounded-2xl" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </>
        ) : !categories.length || totalSpending === 0 ? (
          <div className="rounded-2xl overflow-hidden bg-card border border-border/50">
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <Layers className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No spending data for this month
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Add transactions to see your spending breakdown
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Hero: total + donut + 50/30/20 split */}
            <div className="rounded-2xl overflow-hidden bg-card border border-border/50">
              <div className="p-5 pb-2 text-center">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
                  {formatINR(totalSpending)}
                </p>
              </div>
              <div className="px-4 pt-1">
                <DonutChart
                  data={chartData}
                  category="amount"
                  index="name"
                  valueFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                  colors={colors}
                  showLabel={false}
                  className="h-52 [&_text]:fill-foreground"
                  customTooltip={(props) => (
                    <CustomTooltip {...props} colorMap={colorMap} />
                  )}
                />
              </div>
              {/* 50/30/20 split */}
              <div className="p-4 pt-2 grid grid-cols-3 gap-3">
                {split.map((s) => (
                  <div
                    key={s.key}
                    className={cn(
                      "p-3 rounded-xl border text-center",
                      s.key === "needs" && "bg-needs/5 border-needs/15",
                      s.key === "wants" && "bg-wants/5 border-wants/15",
                      s.key === "savings" && "bg-savings/5 border-savings/15"
                    )}
                  >
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {s.label}
                    </p>
                    <p
                      className={cn(
                        "text-sm font-semibold mt-0.5",
                        s.key === "needs" && "text-needs",
                        s.key === "wants" && "text-wants",
                        s.key === "savings" && "text-savings"
                      )}
                    >
                      ₹{s.amount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {s.percentage}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Category accordion */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  By Category
                </h3>
              </div>
              {categories.map((category, index) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  color={CHART_COLORS_HEX[index % CHART_COLORS_HEX.length]}
                  startDate={startDate}
                  endDate={endDate}
                />
              ))}
            </div>
          </>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}

interface CategorySectionProps {
  category: CategorySpending;
  color: string;
  startDate: Date;
  endDate: Date;
}

function CategorySection({
  category,
  color,
  startDate,
  endDate,
}: CategorySectionProps) {
  const [open, setOpen] = useState(false);
  const isUncategorized = category.id === "uncategorized";

  const { data, isLoading } = useGroupedTransactions({
    startDate,
    endDate,
    categoryId: isUncategorized ? undefined : category.id,
    enabled: open,
  });

  // Flatten server groups into a single list (already date-sorted desc)
  const transactions = useMemo(() => {
    const all = (data?.groups || []).flatMap((g) => g.transactions);
    return isUncategorized ? all.filter((t) => !t.category) : all;
  }, [data, isUncategorized]);

  const CategoryIcon = iconMap[category.icon || "circle"] ?? iconMap.circle;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-xl overflow-hidden bg-card border border-border/50"
    >
      <CollapsibleTrigger className="w-full p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {CategoryIcon ? (
            <CategoryIcon className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {category.name}
            </p>
            <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
              ₹{category.amount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(category.percentage, 100)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
              {category.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-border/30">
          {category.subCategories.map((sub) => (
            <SubCategoryRow
              key={sub.id}
              sub={sub}
              categoryAmount={category.amount}
              transactions={transactions}
              isLoading={isLoading}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface SubCategoryRowProps {
  sub: SubCategorySpending;
  categoryAmount: number;
  transactions: GroupedTransaction[];
  isLoading: boolean;
}

function SubCategoryRow({
  sub,
  categoryAmount,
  transactions,
  isLoading,
}: SubCategoryRowProps) {
  const [open, setOpen] = useState(false);
  const isOther = sub.id.endsWith("-other");

  const subTransactions = useMemo(() => {
    if (isOther) return transactions.filter((t) => !t.subCategory);
    return transactions.filter((t) => t.subCategory?.id === sub.id);
  }, [transactions, sub.id, isOther]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between gap-2 py-2 px-2 rounded-lg hover:bg-muted/40 transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200",
              open && "rotate-90"
            )}
          />
          <span className="text-sm text-foreground truncate">{sub.name}</span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {categoryAmount > 0
              ? `${Math.round((sub.amount / categoryAmount) * 100)}%`
              : "0%"}
          </span>
        </div>
        <span className="text-sm font-medium text-foreground tabular-nums shrink-0">
          ₹{sub.amount.toLocaleString("en-IN")}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="pl-5 pr-1 py-1.5 space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </>
          ) : subTransactions.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 px-1">
              No transactions found
            </p>
          ) : (
            subTransactions.map((t) => (
              <TransactionCard
                key={t.id}
                transaction={mapToTransactionWithRelations(t)}
              />
            ))
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
