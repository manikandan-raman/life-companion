import { StyleSheet } from "@react-pdf/renderer";

// Color palette for the PDF report
export const COLORS = {
  primary: "#3b82f6",
  primaryLight: "#dbeafe",
  secondary: "#64748b",
  background: "#ffffff",
  backgroundAlt: "#f8fafc",
  border: "#e2e8f0",
  text: "#1e293b",
  textMuted: "#64748b",
  textLight: "#94a3b8",
  success: "#22c55e",
  successLight: "#dcfce7",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
  danger: "#ef4444",
  dangerLight: "#fee2e2",
  // Budget type colors
  needs: "#3b82f6",
  needsLight: "#dbeafe",
  wants: "#f59e0b",
  wantsLight: "#fef3c7",
  savings: "#8b5cf6",
  savingsLight: "#ede9fe",
  investments: "#22c55e",
  investmentsLight: "#dcfce7",
};

export const styles = StyleSheet.create({
  // Page
  page: {
    padding: 40,
    paddingBottom: 70,
    fontFamily: "Noto Sans",
    fontSize: 10,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    marginBottom: 30,
    borderBottom: `2px solid ${COLORS.primary}`,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  reportTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "right",
  },
  reportPeriod: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 5,
  },
  generatedDate: {
    fontSize: 9,
    color: COLORS.textLight,
    textAlign: "right",
    marginTop: 5,
  },

  // Section
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: `1px solid ${COLORS.border}`,
  },

  // Summary Cards
  summaryRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.backgroundAlt,
  },
  summaryCardLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryCardValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  summaryCardPositive: {
    color: COLORS.success,
  },
  summaryCardNegative: {
    color: COLORS.danger,
  },

  // Budget Progress
  budgetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 10,
  },
  budgetItem: {
    width: "48%",
    padding: 12,
    borderRadius: 6,
    border: `1px solid ${COLORS.border}`,
    marginBottom: 8,
  },
  budgetItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  budgetItemLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.text,
  },
  budgetItemPercentage: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  budgetProgressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  budgetProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  budgetItemValues: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  budgetItemSpent: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  budgetItemGoal: {
    fontSize: 9,
    color: COLORS.textLight,
  },

  // Chart Section (visual representation)
  chartContainer: {
    flexDirection: "row",
    gap: 20,
    marginTop: 10,
  },
  chartBox: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
    textAlign: "center",
  },
  chartLegend: {
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: 9,
    color: COLORS.text,
    flex: 1,
  },
  legendValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.text,
  },
  legendPercentage: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginLeft: 6,
    width: 35,
    textAlign: "right",
  },

  // Horizontal Bar Chart
  barChartContainer: {
    marginTop: 8,
  },
  barChartItem: {
    marginBottom: 10,
  },
  barChartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  barChartLabel: {
    fontSize: 9,
    color: COLORS.text,
  },
  barChartValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.text,
  },
  barChartTrack: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  barChartFill: {
    height: "100%",
    borderRadius: 4,
  },

  // Table
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundAlt,
    borderBottom: `1px solid ${COLORS.border}`,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottom: `1px solid ${COLORS.border}`,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minHeight: 28,
  },
  tableRowAlt: {
    backgroundColor: COLORS.backgroundAlt,
  },
  tableCell: {
    fontSize: 8,
    color: COLORS.text,
    paddingRight: 4,
  },
  tableCellDate: {
    width: "10%",
  },
  tableCellDescription: {
    width: "30%",
  },
  tableCellCategory: {
    width: "28%",
  },
  tableCellType: {
    width: "14%",
    alignItems: "flex-start",
  },
  tableCellAmount: {
    width: "18%",
    textAlign: "right",
    paddingRight: 0,
  },

  // Type Badge
  typeBadge: {
    fontSize: 7,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    textTransform: "capitalize",
    textAlign: "center",
  },
  typeBadgeNeeds: {
    backgroundColor: COLORS.needsLight,
    color: COLORS.needs,
  },
  typeBadgeWants: {
    backgroundColor: COLORS.wantsLight,
    color: COLORS.wants,
  },
  typeBadgeSavings: {
    backgroundColor: COLORS.savingsLight,
    color: COLORS.savings,
  },
  typeBadgeInvestments: {
    backgroundColor: COLORS.investmentsLight,
    color: COLORS.investments,
  },

  // Insights
  insightCard: {
    padding: 15,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.5,
  },
  insightHighlight: {
    fontWeight: "bold",
    color: COLORS.primary,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: COLORS.textLight,
  },
  pageNumber: {
    fontSize: 8,
    color: COLORS.textLight,
  },

  // Donut Chart Visual (using boxes)
  donutContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  donutChart: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  donutCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  donutCenterValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.text,
  },
  donutCenterLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
  },

  // Pie segments (visual representation)
  pieSegmentRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  pieSegment: {
    height: 20,
  },

  // SVG Pie Chart
  pieChartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
  },
  pieChartCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  pieChartCenterValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.text,
  },
  pieChartCenterLabel: {
    fontSize: 7,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
