"use client";

// TODO: Account selection dropdown inside breadcrumbs.

export interface DropdownAccountBreadcrumbProps {
  accounts: Array<{ id: string; name: string; type?: string }>;
  activeAccount?: string;
  onAccountSelect?: (id: string) => void;
  className?: string;
}

export function DropdownAccountBreadcrumb(props: DropdownAccountBreadcrumbProps) {
  return <div>TODO: DropdownAccountBreadcrumb</div>;
}
