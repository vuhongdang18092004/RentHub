"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && role) {
      if (role === "ROLE_ADMIN") {
        router.replace("/admin/users");
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, role, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-secondary font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-secondary font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Prevent flash of content if authenticated
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
