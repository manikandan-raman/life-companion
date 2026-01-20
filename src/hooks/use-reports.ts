"use client";

import { useState, useCallback } from "react";
import { useSummary } from "./use-transactions";
import { useSpendingBreakdown } from "./use-spending-breakdown";
import { toast } from "sonner";

interface UseReportDataOptions {
  month: number;
  year: number;
}

// Hook to get report preview data (uses existing summary and spending breakdown)
export function useReportData({ month, year }: UseReportDataOptions) {
  // Calculate date range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month

  const summaryQuery = useSummary({ startDate, endDate });
  const spendingBreakdownQuery = useSpendingBreakdown({ startDate, endDate });

  return {
    summary: summaryQuery.data,
    spendingBreakdown: spendingBreakdownQuery.data,
    isLoading: summaryQuery.isLoading || spendingBreakdownQuery.isLoading,
    isError: summaryQuery.isError || spendingBreakdownQuery.isError,
    error: summaryQuery.error || spendingBreakdownQuery.error,
  };
}

// Hook to handle PDF download
export function useDownloadReport() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadReport = useCallback(async (month: number, year: number) => {
    setIsDownloading(true);

    try {
      const response = await fetch(
        `/api/reports?month=${month}&year=${year}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate report");
      }

      // Get the blob from response
      const blob = await response.blob();

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `financial-report-${month}-${year}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Download report error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to download report"
      );
      throw error;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    downloadReport,
    isDownloading,
  };
}
