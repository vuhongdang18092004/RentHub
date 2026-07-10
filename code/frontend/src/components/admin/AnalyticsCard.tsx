import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function AnalyticsCard({ title, value, icon, trend, className = "" }: AnalyticsCardProps) {
  return (
    <div className={`bg-primary border border-secondary rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-secondary">{title}</p>
        <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-semibold text-primary">{value}</p>
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                trend.isPositive
                  ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950"
                  : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950"
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend.value}%
            </span>
            <span className="text-xs text-tertiary">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
