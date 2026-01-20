import {
  Document,
  Page,
  Text,
  View,
  Svg,
  Path,
  Circle,
  G,
  Font,
} from "@react-pdf/renderer";
import { styles, COLORS } from "./styles";
import { format } from "date-fns";

// Register Noto Sans font which supports Indian Rupee symbol (₹)
Font.register({
  family: "Noto Sans",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99d.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyAjBN9d.ttf",
      fontWeight: 700,
    },
  ],
});

// Types for report data
export interface ReportTransaction {
  id: string;
  type: string;
  amount: string;
  description: string | null;
  transactionDate: string;
  category: {
    name: string;
  } | null;
  subCategory: {
    name: string;
  } | null;
}

export interface ReportCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  type: string;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  needs: { current: number; goal: number };
  wants: { current: number; goal: number };
  savings: { current: number; goal: number };
  investments: { current: number; goal: number };
}

export interface ReportData {
  month: number;
  year: number;
  summary: ReportSummary;
  categories: ReportCategory[];
  transactions: ReportTransaction[];
  userName: string;
}

// Format currency in Indian Rupee
function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

// Get month name
function getMonthName(month: number): string {
  const date = new Date(2024, month - 1, 1);
  return format(date, "MMMM");
}

// Calculate percentage
function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

// Get type color
function getTypeColor(type: string): string {
  switch (type) {
    case "needs":
      return COLORS.needs;
    case "wants":
      return COLORS.wants;
    case "savings":
      return COLORS.savings;
    case "investments":
      return COLORS.investments;
    default:
      return COLORS.secondary;
  }
}

// Helper function to create pie chart arc path
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", x, y,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "Z"
  ].join(" ");
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Pie Chart Component
function PieChart({
  data,
  size = 100,
}: {
  data: Array<{ name: string; amount: number; color: string }>;
  size?: number;
}) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  if (total === 0) return null;

  const center = size / 2;
  const radius = size / 2 - 2;
  let currentAngle = 0;

  const slices = data.map((item) => {
    const percentage = item.amount / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // For very small slices, skip to avoid rendering issues
    if (angle < 1) return null;

    return {
      path: describeArc(center, center, radius, startAngle, endAngle),
      color: item.color,
      name: item.name,
    };
  }).filter(Boolean);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((slice, index) => (
        <Path key={index} d={slice!.path} fill={slice!.color} />
      ))}
      {/* Center circle for donut effect */}
      <Circle cx={center} cy={center} r={radius * 0.5} fill="white" />
    </Svg>
  );
}

// Header Component
function ReportHeader({ month, year, userName }: { month: number; year: number; userName: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.logo}>MK Digi</Text>
          <Text style={{ fontSize: 9, color: COLORS.textMuted, marginTop: 2 }}>
            Personal Finance Tracker
          </Text>
        </View>
        <View>
          <Text style={styles.reportTitle}>Monthly Financial Report</Text>
          <Text style={styles.reportPeriod}>
            {getMonthName(month)} {year}
          </Text>
          <Text style={styles.generatedDate}>
            Generated on {format(new Date(), "dd MMM yyyy, HH:mm")}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 9, color: COLORS.textMuted, marginTop: 10 }}>
        Prepared for: {userName}
      </Text>
    </View>
  );
}

// Summary Section
function SummarySection({ summary }: { summary: ReportSummary }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Financial Overview</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardLabel}>Total Income</Text>
          <Text style={[styles.summaryCardValue, styles.summaryCardPositive]}>
            {formatCurrency(summary.totalIncome)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardLabel}>Total Expenses</Text>
          <Text style={[styles.summaryCardValue, styles.summaryCardNegative]}>
            {formatCurrency(summary.totalExpense)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardLabel}>Net Balance</Text>
          <Text
            style={[
              styles.summaryCardValue,
              summary.balance >= 0 ? styles.summaryCardPositive : styles.summaryCardNegative,
            ]}
          >
            {formatCurrency(summary.balance)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Budget Progress Section
function BudgetProgressSection({ summary }: { summary: ReportSummary }) {
  const budgetItems = [
    {
      label: "Needs",
      current: summary.needs.current,
      goal: summary.needs.goal,
      color: COLORS.needs,
      targetPercent: "50%",
    },
    {
      label: "Wants",
      current: summary.wants.current,
      goal: summary.wants.goal,
      color: COLORS.wants,
      targetPercent: "30%",
    },
    {
      label: "Savings",
      current: summary.savings.current,
      goal: summary.savings.goal,
      color: COLORS.savings,
      targetPercent: "10%",
    },
    {
      label: "Investments",
      current: summary.investments.current,
      goal: summary.investments.goal,
      color: COLORS.investments,
      targetPercent: "10%",
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Budget Analysis (50/30/20 Rule)</Text>
      <View style={styles.budgetRow}>
        {budgetItems.map((item) => {
          const percentage = calculatePercentage(item.current, item.goal);
          const isOverTarget = item.current > item.goal && item.goal > 0;
          // For needs/wants, going over budget is bad (red)
          // For savings/investments, going over target is good (keep original color)
          const isExpenseCategory = item.label === "Needs" || item.label === "Wants";
          const showWarning = isOverTarget && isExpenseCategory;
          return (
            <View key={item.label} style={styles.budgetItem}>
              <View style={styles.budgetItemHeader}>
                <Text style={styles.budgetItemLabel}>{item.label}</Text>
                <Text style={styles.budgetItemPercentage}>
                  Target: {item.targetPercent}
                </Text>
              </View>
              <View style={styles.budgetProgressBar}>
                <View
                  style={[
                    styles.budgetProgressFill,
                    {
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: showWarning ? COLORS.danger : item.color,
                    },
                  ]}
                />
              </View>
              <View style={styles.budgetItemValues}>
                <Text style={styles.budgetItemSpent}>
                  Spent: {formatCurrency(item.current)}
                </Text>
                <Text style={styles.budgetItemGoal}>
                  Goal: {formatCurrency(item.goal)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Spending Breakdown Section
function SpendingBreakdownSection({
  summary,
  categories,
}: {
  summary: ReportSummary;
  categories: ReportCategory[];
}) {
  const totalSpending = summary.totalExpense;

  // Spending by type data
  const spendingByType = [
    { name: "Needs", amount: summary.needs.current, color: COLORS.needs },
    { name: "Wants", amount: summary.wants.current, color: COLORS.wants },
    { name: "Savings", amount: summary.savings.current, color: COLORS.savings },
    { name: "Investments", amount: summary.investments.current, color: COLORS.investments },
  ].filter((item) => item.amount > 0);

  // Top categories (limit to 5 to fit better)
  const topCategories = categories.slice(0, 5);
  const categoryColors = [
    COLORS.needs,
    COLORS.wants,
    COLORS.savings,
    COLORS.investments,
    COLORS.primary,
  ];

  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>Spending Breakdown</Text>
      <View style={styles.chartContainer}>
        {/* By Type - with Pie Chart */}
        <View style={styles.chartBox}>
          <Text style={styles.chartTitle}>By Budget Type</Text>
          {/* Pie Chart */}
          {totalSpending > 0 && (
            <View style={styles.pieChartContainer}>
              <PieChart data={spendingByType} size={120} />
              <View style={styles.pieChartCenter}>
                <Text style={styles.pieChartCenterValue}>
                  {formatCurrency(totalSpending)}
                </Text>
                <Text style={styles.pieChartCenterLabel}>Total</Text>
              </View>
            </View>
          )}
          {/* Legend */}
          <View style={styles.chartLegend}>
            {spendingByType.map((item) => {
              const percentage =
                totalSpending > 0
                  ? ((item.amount / totalSpending) * 100).toFixed(1)
                  : "0";
              return (
                <View key={item.name} style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.legendText}>{item.name}</Text>
                  <Text style={styles.legendValue}>{formatCurrency(item.amount)}</Text>
                  <Text style={styles.legendPercentage}>{percentage}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* By Category - with Bar Chart */}
        <View style={styles.chartBox}>
          <Text style={styles.chartTitle}>Top Categories</Text>
          <View style={styles.barChartContainer}>
            {topCategories.map((cat, index) => {
              const percentage =
                totalSpending > 0
                  ? ((cat.amount / totalSpending) * 100).toFixed(1)
                  : "0";
              const maxAmount = topCategories[0]?.amount || 1;
              const barWidth = (cat.amount / maxAmount) * 100;
              return (
                <View key={cat.id} style={styles.barChartItem}>
                  <View style={styles.barChartHeader}>
                    <Text style={styles.barChartLabel}>{cat.name}</Text>
                    <Text style={styles.barChartValue}>
                      {formatCurrency(cat.amount)} ({percentage}%)
                    </Text>
                  </View>
                  <View style={styles.barChartTrack}>
                    <View
                      style={[
                        styles.barChartFill,
                        {
                          width: `${barWidth}%`,
                          backgroundColor: categoryColors[index % categoryColors.length],
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

// Transaction Table Section
function TransactionTableSection({
  transactions,
}: {
  transactions: ReportTransaction[];
}) {
  if (transactions.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Details</Text>
        <Text style={{ fontSize: 10, color: COLORS.textMuted, textAlign: "center", padding: 20 }}>
          No transactions recorded this month
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Transaction Details ({transactions.length} transactions)
      </Text>
      <View style={styles.table}>
        {/* Header - fixed on each page */}
        <View style={styles.tableHeader} fixed>
          <Text style={[styles.tableHeaderCell, styles.tableCellDate]}>Date</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellDescription]}>
            Description
          </Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellCategory]}>
            Category
          </Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellType]}>Type</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellAmount]}>
            Amount
          </Text>
        </View>
        {/* All transaction rows */}
        {transactions.map((tx, index) => {
          const typeBadgeStyle =
            tx.type === "needs"
              ? styles.typeBadgeNeeds
              : tx.type === "wants"
              ? styles.typeBadgeWants
              : tx.type === "savings"
              ? styles.typeBadgeSavings
              : styles.typeBadgeInvestments;

          // Format category display - truncate if too long
          const categoryDisplay = tx.category?.name || "Uncategorized";
          const subCategoryDisplay = tx.subCategory ? ` > ${tx.subCategory.name}` : "";
          const fullCategory = categoryDisplay + subCategoryDisplay;

          return (
            <View
              key={tx.id}
              style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
              wrap={false}
            >
              <View style={styles.tableCellDate}>
                <Text style={styles.tableCell}>
                  {format(new Date(tx.transactionDate), "dd MMM")}
                </Text>
              </View>
              <View style={styles.tableCellDescription}>
                <Text style={styles.tableCell}>
                  {tx.description || "-"}
                </Text>
              </View>
              <View style={styles.tableCellCategory}>
                <Text style={styles.tableCell}>
                  {fullCategory}
                </Text>
              </View>
              <View style={styles.tableCellType}>
                <Text style={[styles.typeBadge, typeBadgeStyle]}>{tx.type}</Text>
              </View>
              <View style={styles.tableCellAmount}>
                <Text style={[styles.tableCell, { textAlign: "right" }]}>
                  {formatCurrency(parseFloat(tx.amount))}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Insights Section
function InsightsSection({
  summary,
  categories,
}: {
  summary: ReportSummary;
  categories: ReportCategory[];
}) {
  const totalSpending = summary.totalExpense;
  const savingsRate =
    summary.totalIncome > 0
      ? (((summary.savings.current + summary.investments.current) / summary.totalIncome) * 100).toFixed(1)
      : "0";

  const topCategories = categories.slice(0, 3);

  // Budget status
  const needsStatus =
    summary.needs.goal > 0 && summary.needs.current > summary.needs.goal
      ? "over"
      : "within";
  const wantsStatus =
    summary.wants.goal > 0 && summary.wants.current > summary.wants.goal
      ? "over"
      : "within";

  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>Monthly Insights</Text>
      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>Key Highlights</Text>
        <Text style={styles.insightText}>
          {summary.totalIncome > 0 ? (
            <>
              Your savings rate this month is{" "}
              <Text style={styles.insightHighlight}>{savingsRate}%</Text> of your
              income. The recommended target is 20%.
            </>
          ) : (
            "No income recorded this month."
          )}
        </Text>
        {"\n"}
        <Text style={styles.insightText}>
          You are{" "}
          <Text style={styles.insightHighlight}>{needsStatus} budget</Text> for
          essential needs and{" "}
          <Text style={styles.insightHighlight}>{wantsStatus} budget</Text> for
          discretionary wants.
        </Text>
        {topCategories.length > 0 && (
          <>
            {"\n"}
            <Text style={styles.insightText}>
              Top spending categories:{" "}
              <Text style={styles.insightHighlight}>
                {topCategories.map((c) => c.name).join(", ")}
              </Text>
              {totalSpending > 0 &&
                ` (${((topCategories.reduce((sum, c) => sum + c.amount, 0) / totalSpending) * 100).toFixed(0)}% of total spending)`}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

// Footer Component
function ReportFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        MK Digi - Personal Finance Tracker | Confidential
      </Text>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

// Main Report Document
export function MonthlyReportDocument({ data }: { data: ReportData }) {
  return (
    <Document
      title={`Financial Report - ${getMonthName(data.month)} ${data.year}`}
      author="MK Digi"
      subject="Monthly Financial Report"
    >
      <Page size="A4" style={styles.page}>
        <ReportHeader month={data.month} year={data.year} userName={data.userName} />
        <SummarySection summary={data.summary} />
        <BudgetProgressSection summary={data.summary} />
        <SpendingBreakdownSection summary={data.summary} categories={data.categories} />
        <InsightsSection summary={data.summary} categories={data.categories} />
        <ReportFooter />
      </Page>
      {/* Second page for transactions if needed */}
      {data.transactions.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.logo}>MK Digi</Text>
            <Text style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>
              {getMonthName(data.month)} {data.year} - Transaction Details
            </Text>
          </View>
          <TransactionTableSection transactions={data.transactions} />
          <ReportFooter />
        </Page>
      )}
    </Document>
  );
}
