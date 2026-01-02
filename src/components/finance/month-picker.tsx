"use client";

import { useMemo } from "react";
import { format, subMonths, addMonths, startOfMonth } from "date-fns";
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonthPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  monthsToShow?: number;
  futureMonths?: number;
}

export function MonthPicker({ value, onChange, monthsToShow = 12, futureMonths = 1 }: MonthPickerProps) {
  // Generate list of months (future months + current month + past months)
  const months = useMemo(() => {
    const result: { value: string; label: string; date: Date }[] = [];
    const today = new Date();

    // Add future months first (most future at top)
    for (let i = futureMonths; i >= 1; i--) {
      const date = startOfMonth(addMonths(today, i));
      result.push({
        value: format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy"),
        date,
      });
    }

    // Add current month and past months
    for (let i = 0; i <= monthsToShow; i++) {
      const date = startOfMonth(subMonths(today, i));
      result.push({
        value: format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy"),
        date,
      });
    }

    return result;
  }, [monthsToShow, futureMonths]);

  const currentValue = format(startOfMonth(value), "yyyy-MM");

  const handleChange = (selectedValue: string) => {
    const selected = months.find((m) => m.value === selectedValue);
    if (selected) {
      onChange(selected.date);
    }
  };

  return (
    <Select value={currentValue} onValueChange={handleChange}>
      <SelectTrigger className="w-auto min-w-[180px] h-10 px-4 rounded-full bg-muted/50 border-border/50 hover:bg-muted/70 transition-colors">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Select month" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {months.map((month) => (
          <SelectItem key={month.value} value={month.value}>
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

