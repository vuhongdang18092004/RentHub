"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "../foundations/logo";

export interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();

  // Active link helper
  const isActive = (path: string, exact = true) => {
    if (!pathname) return false;
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };

  const navLinkClass = (path: string, exact = true) => {
    const active = isActive(path, exact);
    return `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
      active
        ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
        : "text-secondary hover:bg-tertiary hover:text-primary"
    }`;
  };

  return (
    <div className="min-h-screen w-full flex bg-secondary font-sans">
      
      {/* Sidebar - fixed on desktop, hidden on mobile (collapsible template) */}
      <aside className="w-64 border-r border-secondary bg-primary flex flex-col justify-between p-6 shrink-0 hidden md:flex">
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="px-2">
            <Logo />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link href="/dashboard" className={navLinkClass("/dashboard")}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Tổng quan
            </Link>

            <Link href="/dashboard?tab=profile" className={navLinkClass("/dashboard?tab=profile")}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Hồ sơ cá nhân
            </Link>

            <Link href="/products/my" className={navLinkClass("/products/my")}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Kho đồ của tôi
            </Link>

            <Link href="/products/create" className={navLinkClass("/products/create")}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Đăng sản phẩm
            </Link>

            {/* ADMIN Specific Links */}
            {role === "ROLE_ADMIN" && (
              <div className="pt-4 mt-4 border-t border-secondary space-y-1">
                <div className="px-4 py-2 text-xs font-bold text-quaternary uppercase tracking-wider">
                  Admin Panel
                </div>
                <Link href="/admin/users" className={navLinkClass("/admin/users")}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Quản lý người dùng
                </Link>
                <Link href="/admin/categories" className={navLinkClass("/admin/categories")}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Quản lý danh mục
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Sidebar Footer (User details + Logout) */}
        <div className="pt-4 border-t border-secondary space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold shrink-0">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-primary truncate">{user?.fullName || "Thành viên"}</p>
              <p className="text-xs text-secondary truncate">{user?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-error-primary hover:bg-red-50 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden border-b border-secondary bg-primary px-6 py-4 flex items-center justify-between">
          <Logo />
          <button
            onClick={logout}
            className="p-2 text-error-primary hover:bg-red-50 rounded-xl transition-all cursor-pointer"
            aria-label="Đăng xuất"
          >
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </header>

        {/* Dashboard Pages Mount */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
