"use client";

import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthHero } from "@/components/auth/auth-hero";
import { LoginForm } from "@/components/auth/login-form";
import { User, Star, Users } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = (fullName: string) => {
    const role = localStorage.getItem("role");
    if (role === "ROLE_ADMIN") {
      router.push("/admin/dashboard");
    } else {
      router.push("/");
    }
  };

  // Top widgets for the login page hero
  const topWidgets = (
    <>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl flex items-center gap-3 text-white">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm">1,200+</span>
          <span className="text-xs text-white/80">Người cho thuê</span>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white flex items-center gap-2">
        Đánh giá trung bình <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> 4.8
      </div>
    </>
  );

  // Bottom card widget for the login page hero
  const bottomBadge = (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-white shadow-xl flex justify-between items-center gap-6">
      <div className="space-y-1.5">
        <h3 className="text-xl md:text-2xl font-bold leading-tight">4,000+ món đồ</h3>
        <p className="text-white/80 text-sm">sẵn sàng cho thuê gần bạn</p>
      </div>
      {/* Overlapping Profile Pictures */}
      <div className="flex items-center -space-x-3 overflow-hidden select-none">
        <img
          className="inline-block h-10 w-10 rounded-full ring-2 ring-white/20 object-cover"
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"
          alt="User 1"
        />
        <img
          className="inline-block h-10 w-10 rounded-full ring-2 ring-white/20 object-cover"
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60"
          alt="User 2"
        />
        <img
          className="inline-block h-10 w-10 rounded-full ring-2 ring-white/20 object-cover"
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60"
          alt="User 3"
        />
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 ring-2 ring-white/20 text-xs font-bold text-white shadow-inner">
          <Users className="w-4 h-4" />
        </div>
      </div>
    </div>
  );

  const hero = (
    <AuthHero
      image="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80"
      title="Khám phá ngay"
      subtitle="Tham gia cộng đồng cho thuê đồ lớn nhất Việt Nam"
      topWidgets={topWidgets}
      badge={bottomBadge}
    />
  );

  return (
    <AuthLayout
      form={<LoginForm onSuccess={handleLoginSuccess} />}
      hero={hero}
    />
  );
}
