"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);

  // Kiểm tra thẻ thông hành (Token) bảo mật xem có thật không
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập! Vui lòng quay lại.");
      router.push("/login"); // Trục xuất về trang Login nếu cố tình vào lậu
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Xóa token trong két sắt
    router.push("/login"); // Đẩy về trang đăng nhập
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Thanh Navbar phía trên */}
      <nav className="bg-white border-b border-zinc-200 px-8 py-4 flex justify-between items-center">
        <div className="font-bold text-xl text-[#3F1B6B]">RentHub Dashboard</div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-semibold transition-colors"
        >
          Đăng xuất
        </button>
      </nav>

      {/* Nội dung trang chủ sau này của bạn */}
      <main className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="bg-white p-8 rounded-[24px] shadow-sm border border-zinc-100 space-y-2">
          <h2 className="text-2xl font-bold text-zinc-900">🎉 Đăng nhập thông luồng thành công!</h2>
          <p className="text-zinc-500 text-sm">
            Tài khoản của bạn đã được xác thực thông qua chiếc thẻ JWT Token lưu dưới LocalStorage. Từ đây bạn có thể thoải mái gọi các API cần bảo mật của Spring Boot.
          </p>
        </div>
      </main>
    </div>
  );
}