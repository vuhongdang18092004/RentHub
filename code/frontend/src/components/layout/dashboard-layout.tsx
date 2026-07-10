"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "../foundations/logo";
import {
  User,
  Package,
  ClipboardList,
  HandCoins,
  Bell,
  Heart,
  PlusCircle,
  LayoutDashboard,
  Users,
  FolderTree,
  CheckCircle,
  AlertTriangle,
  Star,
  Zap,
  Settings,
  LogOut,
  CreditCard,
  FileText,
  ScrollText,
} from "lucide-react";

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
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
      active
        ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 shadow-sm"
        : "text-secondary hover:bg-tertiary hover:text-primary"
    }`;
  };

  const sectionLabel = (text: string) => (
    <div className="px-3 pt-5 pb-1.5">
      <p className="text-[11px] font-semibold text-quaternary uppercase tracking-widest">{text}</p>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex bg-secondary font-sans">
      
      {/* Sidebar - fixed on desktop, hidden on mobile */}
      <aside className="w-[264px] border-r border-secondary bg-primary flex flex-col justify-between py-6 shrink-0 hidden md:flex">
        <div className="flex flex-col gap-1">
          {/* Logo Brand */}
          <div className="px-6 pb-6">
            <Link href="/">
              <Logo />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 flex flex-col gap-0.5">
            {sectionLabel("Cá nhân")}
            <Link href="/profile" className={navLinkClass("/profile")}>
              <User className="w-[18px] h-[18px]" />
              Hồ sơ cá nhân
            </Link>

            {role !== "ROLE_ADMIN" && (
              <>
                {sectionLabel("Sản phẩm")}
                <Link href="/products/my" className={navLinkClass("/products/my")}>
                  <Package className="w-[18px] h-[18px]" />
                  Kho đồ của tôi
                </Link>
                <Link href="/products/create" className={navLinkClass("/products/create")}>
                  <PlusCircle className="w-[18px] h-[18px]" />
                  Đăng sản phẩm
                </Link>
                <Link href="/products/favorites" className={navLinkClass("/products/favorites")}>
                  <Heart className="w-[18px] h-[18px]" />
                  Sản phẩm yêu thích
                </Link>

                {sectionLabel("Giao dịch")}
                <Link href="/rentals/renter" className={navLinkClass("/rentals/renter")}>
                  <ClipboardList className="w-[18px] h-[18px]" />
                  Đơn thuê của tôi
                </Link>
                <Link href="/rentals/owner" className={navLinkClass("/rentals/owner")}>
                  <HandCoins className="w-[18px] h-[18px]" />
                  Yêu cầu thuê gửi đến
                </Link>

                {sectionLabel("Khác")}
                <Link href="/notifications" className={navLinkClass("/notifications")}>
                  <Bell className="w-[18px] h-[18px]" />
                  Thông báo
                </Link>
              </>
            )}

            {/* ADMIN Specific Links */}
            {role === "ROLE_ADMIN" && (
              <>
                {sectionLabel("Quản trị")}
                <Link href="/admin/dashboard" className={navLinkClass("/admin/dashboard")}>
                  <LayoutDashboard className="w-[18px] h-[18px]" />
                  Tổng quan
                </Link>
                <Link href="/admin/users" className={navLinkClass("/admin/users")}>
                  <Users className="w-[18px] h-[18px]" />
                  Quản lý người dùng
                </Link>
                <Link href="/admin/categories" className={navLinkClass("/admin/categories")}>
                  <FolderTree className="w-[18px] h-[18px]" />
                  Quản lý danh mục
                </Link>
                <Link href="/admin/products" className={navLinkClass("/admin/products")}>
                  <CheckCircle className="w-[18px] h-[18px]" />
                  Duyệt sản phẩm
                </Link>

                {sectionLabel("Tài chính & Giao dịch")}
                <Link href="/admin/payments" className={navLinkClass("/admin/payments")}>
                  <CreditCard className="w-[18px] h-[18px]" />
                  Quản lý thanh toán
                </Link>
                <Link href="/admin/rentals" className={navLinkClass("/admin/rentals")}>
                  <FileText className="w-[18px] h-[18px]" />
                  Quản lý đơn thuê
                </Link>

                {sectionLabel("Giám sát")}
                <Link href="/admin/reports" className={navLinkClass("/admin/reports")}>
                  <AlertTriangle className="w-[18px] h-[18px]" />
                  Quản lý khiếu nại
                </Link>
                <Link href="/admin/reviews" className={navLinkClass("/admin/reviews")}>
                  <Star className="w-[18px] h-[18px]" />
                  Quản lý đánh giá
                </Link>
                <Link href="/admin/risk" className={navLinkClass("/admin/risk")}>
                  <Zap className="w-[18px] h-[18px]" />
                  Phân tích rủi ro
                </Link>
                <Link href="/admin/audit-logs" className={navLinkClass("/admin/audit-logs")}>
                  <ScrollText className="w-[18px] h-[18px]" />
                  Nhật ký hoạt động
                </Link>

                {sectionLabel("Hệ thống")}
                <Link href="/admin/system" className={navLinkClass("/admin/system")}>
                  <Settings className="w-[18px] h-[18px]" />
                  Hệ thống & Cài đặt
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Sidebar Footer (User details + Logout) */}
        <div className="px-3 pt-4 mt-2 border-t border-secondary">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 text-sm font-semibold shrink-0">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-primary truncate">{user?.fullName || "Thành viên"}</p>
              <p className="text-xs text-tertiary truncate">{user?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-secondary hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition-all duration-200 cursor-pointer mt-1"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden border-b border-secondary bg-primary px-5 py-3.5 flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-2">
            <Link href="/notifications" className="p-2 text-secondary hover:bg-tertiary rounded-lg transition-all duration-200">
              <Bell className="w-5 h-5" />
            </Link>
            <button
              onClick={logout}
              className="p-2 text-error-primary hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-all duration-200 cursor-pointer"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dashboard Pages Mount */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
