"use client";

import LoginForm from "../../components/features/auth/LoginForm";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex bg-zinc-100 items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-4xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-150">
        {/* Cột trái: Form nhập liệu */}
        <div className="flex flex-col justify-center items-center px-8 py-12 md:px-16 bg-white">
          <div className="w-full max-w-sm mb-8 font-bold text-xl text-[#3F1B6B] flex items-center gap-2">
            <span className="p-1.5 bg-[#3F1B6B] text-white rounded-lg text-xs tracking-wider">SO</span> RentHub
          </div>
          
          <LoginForm onSuccess={() => router.push("/dashboard")} />
        </div>

        {/* Cột phải: Banner hình ảnh nghệ thuật */}
        <div className="hidden md:block relative p-4 bg-white">
          <div className="w-full h-full rounded-3xl overflow-hidden relative bg-linear-to-tr from-[#3F1B6B] to-indigo-900 flex flex-col justify-end p-10">
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1527631746610-bca00a040d60')] bg-cover bg-center" />
            <div className="relative z-10 space-y-3 text-white">
              <div className="inline-flex bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-medium">
                ⭐ Đánh giá trung bình 4.8
              </div>
              <h3 className="text-3xl font-bold leading-tight">4,000+ món đồ sẵn sàng cho thuê gần bạn</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}