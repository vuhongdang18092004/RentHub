"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/cart-context";
import { Logo } from "../foundations/logo";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <header className="w-full bg-white border-b border-zinc-100 px-6 py-3.5 sticky top-0 z-50 font-sans">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left: RentHub Logo */}
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        {/* Center: Pill Search Bar */}
        <div className="hidden md:flex items-center bg-white border border-zinc-200 rounded-full py-1.5 pl-6 pr-2 shadow-sm hover:shadow-md transition-all divide-x divide-zinc-200 gap-3 max-w-[520px] w-full">
          <div className="flex-1 flex flex-col text-left">
            <span className="text-[10px] font-semibold text-zinc-400 tracking-wide">Vị trí hiện tại</span>
            <input
              type="text"
              placeholder="Nhập địa điểm..."
              className="text-xs font-semibold text-zinc-800 bg-transparent border-none outline-none placeholder-zinc-400 p-0 w-full"
            />
          </div>
          <div className="flex-1 pl-4 flex flex-col text-left">
            <span className="text-[10px] font-semibold text-zinc-400 tracking-wide">Thời gian</span>
            <span className="text-xs font-semibold text-zinc-800 truncate">Bất kỳ lúc nào</span>
          </div>
          <div className="flex-1 pl-4 flex items-center justify-between gap-2">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-semibold text-zinc-400 tracking-wide">Từ khóa</span>
              <input
                type="text"
                placeholder="flycam"
                className="text-xs font-semibold text-zinc-800 bg-transparent border-none outline-none placeholder-zinc-400 p-0 w-full"
              />
            </div>
            {/* Ghost search icon — no filled circle background */}
            <button className="p-1.5 text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded-full transition-all cursor-pointer shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Menu Actions */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">
            Khám phá
          </Link>
          <Link href="/products/create" className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">
            Cho thuê
          </Link>
          
          {/* Cart icon — shopping bag with badge */}
          <Link href="/cart" className="relative p-2 hover:bg-zinc-50 rounded-xl text-zinc-600 hover:text-zinc-900 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          {/* User Account Action */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 pl-2 border-l border-zinc-200 hover:opacity-90 focus:outline-none transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0 relative">
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                  {user?.role === "ROLE_ADMIN" && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border border-white rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-sm font-semibold text-zinc-700 hidden sm:inline truncate max-w-[100px]">
                  {user?.fullName}
                </span>
                {user?.role === "ROLE_ADMIN" && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded tracking-wider">
                    Admin
                  </span>
                )}
              </button>

              {/* Dropdown Menu Portal */}
              {dropdownOpen && (
                <>
                  {/* Backdrop overlay to close dropdown */}
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-zinc-150 rounded-2xl shadow-xl py-2 z-50 divide-y divide-zinc-100 font-sans">
                    
                    {/* User profile details header */}
                    <div className="px-4 py-2 flex flex-col">
                      <span className="text-xs font-bold text-zinc-800 truncate">{user?.fullName}</span>
                      <span className="text-[10px] text-zinc-500 truncate">{user?.email}</span>
                    </div>

                    {/* Role specific links */}
                    {user?.role === "ROLE_ADMIN" ? (
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                        >
                          Hồ sơ cá nhân
                        </Link>
                        <Link
                          href="/admin/users"
                          onClick={() => setDropdownOpen(false)}
                          className="flex px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                        >
                          Quản lý người dùng
                        </Link>
                        <Link
                          href="/admin/categories"
                          onClick={() => setDropdownOpen(false)}
                          className="flex px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                        >
                          Quản lý danh mục
                        </Link>
                      </div>
                    ) : (
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                        >
                          Hồ sơ cá nhân
                        </Link>
                        <Link
                          href="/products/my"
                          onClick={() => setDropdownOpen(false)}
                          className="flex px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                        >
                          Kho đồ của tôi
                        </Link>
                        <Link
                          href="/products/create"
                          onClick={() => setDropdownOpen(false)}
                          className="flex px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                        >
                          Đăng sản phẩm
                        </Link>
                      </div>
                    )}

                    {/* Logout operation */}
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex px-4 py-2 text-xs font-bold text-zinc-800 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        Đăng xuất
                      </button>
                    </div>

                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-full text-xs font-bold transition-all border border-brand-100"
            >
              Đăng nhập
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
