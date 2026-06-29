"use client";

import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthHero } from "@/components/auth/auth-hero";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = (fullName: string) => {
    router.push("/dashboard");
  };

  // Top widgets for the login page hero
  const topWidgets = (
    <>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-white">
        <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs">
          👤
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xs">1,200+</span>
          <span className="text-[10px] text-white/80">Người cho thuê</span>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white flex items-center gap-1.5">
        Đánh giá trung bình <span className="text-yellow-400">★★★★★</span> 4.8
      </div>
    </>
  );

  // Bottom card widget for the login page hero
  const bottomBadge = (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white shadow-lg flex justify-between items-center gap-4">
      <div className="space-y-1">
        <h3 className="text-lg md:text-xl font-bold leading-tight">4,000+ món đồ</h3>
        <p className="text-white/80 text-xs">sẵn sàng cho thuê gần bạn</p>
      </div>
      {/* Overlapping Profile Pictures */}
      <div className="flex items-center -space-x-2.5 overflow-hidden select-none">
        <img
          className="inline-block h-8 w-8 rounded-full ring-2 ring-white/20 object-cover"
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"
          alt="User 1"
        />
        <img
          className="inline-block h-8 w-8 rounded-full ring-2 ring-white/20 object-cover"
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60"
          alt="User 2"
        />
        <img
          className="inline-block h-8 w-8 rounded-full ring-2 ring-white/20 object-cover"
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60"
          alt="User 3"
        />
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 ring-2 ring-white/20 text-[10px] font-bold text-white">
          +99
        </div>
      </div>
    </div>
  );

  const hero = (
    <AuthHero
      image="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80"
      title="4,000+ món đồ"
      subtitle="sẵn sàng cho thuê gần bạn"
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
