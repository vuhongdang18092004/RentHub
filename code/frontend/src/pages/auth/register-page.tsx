"use client";

import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthHero } from "@/components/auth/auth-hero";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  // Top widgets for the register page hero
  const topWidgets = (
    <>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-white space-y-1">
        <div className="text-[10px] text-white/80 font-medium">Danh mục phổ biến</div>
        <div className="flex gap-1.5 mt-1">
          <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-semibold">Máy ảnh</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-semibold">Camping</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-semibold">Xe đạp</span>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white flex items-center gap-1.5">
        Đánh giá trung bình <span className="text-yellow-400">★★★★★</span> 4.8
      </div>
    </>
  );

  // Bottom card widget for the register page hero
  const bottomBadge = (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-white shadow-lg flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center text-lg select-none">
        💼
      </div>
      <div className="space-y-0.5">
        <h3 className="text-md md:text-lg font-bold leading-tight">Đăng ký miễn phí</h3>
        <p className="text-white/80 text-xs">
          Thuê đồ từ <span className="font-bold text-white">30+ khu vực</span> trên cả nước
        </p>
      </div>
      <div className="ml-auto text-xs bg-white/20 px-2.5 py-1 rounded-lg font-semibold">
        📍 30+
      </div>
    </div>
  );

  const hero = (
    <AuthHero
      image="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1200&q=80"
      title="Đăng ký miễn phí"
      subtitle="Thuê đồ từ 30+ khu vực trên cả nước"
      topWidgets={topWidgets}
      badge={bottomBadge}
    />
  );

  return (
    <AuthLayout
      form={<RegisterForm />}
      hero={hero}
    />
  );
}
