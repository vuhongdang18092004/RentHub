"use client";

// TODO: Dropdown with advanced search filters.

export interface DropdownSearchAdvancedProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  filters?: Record<string, any>;
  onFiltersChange?: (filters: Record<string, any>) => void;
  className?: string;
}

export function DropdownSearchAdvanced(props: DropdownSearchAdvancedProps) {
  return <div>TODO: DropdownSearchAdvanced</div>;
}
