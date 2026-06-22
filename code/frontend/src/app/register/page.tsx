"use client";

import RegisterForm from "../../components/features/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex bg-zinc-100 items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
        {/* Cột trái: Form nhập liệu */}
        <div className="flex flex-col justify-center items-center px-8 py-12 md:px-16 bg-white">
          <div className="w-full max-w-sm mb-8 font-bold text-xl text-[#3F1B6B]">
            <span className="p-1.5 bg-[#3F1B6B] text-white rounded-lg text-xs mr-2">SO</span>RentHub
          </div>
          <RegisterForm />
        </div>

        <div className="hidden md:block relative p-4 bg-white">
          <div className="w-full h-full rounded-[24px] overflow-hidden relative bg-gradient-to-br from-purple-900 to-[#3F1B6B] flex flex-col justify-end p-10">
            <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1539635278303-d4002c07eae3')] bg-cover bg-center" />
            <div className="relative z-10 text-white space-y-2">
              <div className="text-4xl font-bold">1,200+</div>
              <p className="text-zinc-200 text-sm">Người cho thuê tin dùng hệ thống mỗi ngày</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}