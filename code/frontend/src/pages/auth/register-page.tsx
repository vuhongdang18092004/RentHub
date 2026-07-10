"use client";

import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthHero } from "@/components/auth/auth-hero";
import { RegisterForm } from "@/components/auth/register-form";
import { Star, Briefcase, MapPin } from "lucide-react";

export default function RegisterPage() {
  // Top widgets for the register page hero
  const topWidgets = (
    <>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white space-y-2 shadow-lg">
        <div className="text-xs text-white/80 font-medium uppercase tracking-wider">Danh mục phổ biến</div>
        <div className="flex gap-2 mt-1">
          <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-semibold shadow-sm">Máy ảnh</span>
          <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-semibold shadow-sm">Camping</span>
          <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-semibold shadow-sm">Xe đạp</span>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white flex items-center gap-2 shadow-lg">
        Đánh giá trung bình <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> 4.8
      </div>
    </>
  );

  // Bottom card widget for the register page hero
  const bottomBadge = (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-white shadow-xl flex items-center gap-5">
      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
        <Briefcase className="w-6 h-6 text-white" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg md:text-xl font-bold leading-tight">Đăng ký miễn phí</h3>
        <p className="text-white/80 text-sm">
          Thuê đồ từ <span className="font-bold text-white">30+ khu vực</span> trên cả nước
        </p>
      </div>
      <div className="ml-auto flex items-center gap-1.5 text-sm bg-white/20 px-3 py-1.5 rounded-xl font-semibold shadow-sm">
        <MapPin className="w-4 h-4" /> 30+
      </div>
    </div>
  );

  const hero = (
    <AuthHero
      image="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1200&q=80"
      title="Bắt đầu ngay"
      subtitle="Tạo tài khoản miễn phí để thuê và cho thuê hàng ngàn món đồ"
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
