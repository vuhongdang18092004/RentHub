"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (role !== "ROLE_ADMIN") {
        router.replace("/");
      }
    }
  }, [isAuthenticated, role, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-secondary font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-secondary font-medium">Đang xác thực quyền hạn...</p>
        </div>
      </div>
    );
  }

  // Prevent flash of content if not authorized
  if (!isAuthenticated || role !== "ROLE_ADMIN") {
    return null;
  }

  return <>{children}</>;
}
