"use client";

import { ReactNode } from "react";
import { Logo } from "../foundations/logo";

export interface AuthLayoutProps {
  form: ReactNode;
  hero: ReactNode;
  className?: string;
}

export function AuthLayout({ form, hero, className = "" }: AuthLayoutProps) {
  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 bg-secondary font-sans auth-theme-forced ${className}`}>
      {/* Auth Card Container */}
      <div className="w-full max-w-[1200px] bg-primary rounded-[24px] shadow-lg overflow-hidden border border-secondary grid grid-cols-1 lg:grid-cols-10 min-h-[650px] p-4 gap-4">
        
        {/* Left Side: Form Section (45% on desktop / 50% on tablet / 100% on mobile) */}
        <div className="lg:col-span-4 flex flex-col justify-between px-6 py-8 md:px-12 bg-primary rounded-[20px]">
          {/* Header Branding Area */}
          <div className="w-full mb-8">
            <Logo />
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col justify-center">
            {form}
          </div>

          {/* Footer spacing */}
          <div className="mt-8 text-center text-xs text-quaternary">
            Điều khoản sử dụng • Chính sách bảo mật
          </div>
        </div>

        {/* Right Side: Hero Section (55% on desktop / 50% on tablet / Hidden on mobile) */}
        <div className="hidden lg:block lg:col-span-6 relative">
          {hero}
        </div>

      </div>
    </div>
  );
}
