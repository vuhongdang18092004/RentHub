"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState<string>("Thành viên");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập! Vui lòng quay lại.");
      router.push("/login"); // Trục xuất về trang Login nếu cố tình vào lậu
      return;
    }

    try {
      // Token cấu trúc: Header.Payload.Signature
      const payloadBase64 = token.split(".")[1]; // Bốc lấy phần Payload ở giữa
      
      if (payloadBase64) {
        // Giải mã chuỗi Base64 sang chuỗi JSON dạng UTF-8 để không bị lỗi font tiếng Việt
        const decodedPayload = JSON.parse(
          decodeURIComponent(
            atob(payloadBase64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          )
        );

        // 💡 LƯU Ý: Bạn check xem trong backend gán tên vào trường nào nhé (thường là 'fullName' hoặc 'sub')
        const name = decodedPayload.fullName || decodedPayload.sub || "Thành viên";
        setFullName(name);
      }
    } catch (error) {
      console.error("Lỗi giải mã thẻ thông hành JWT:", error);
      // Nếu token rác hoặc lỗi cấu trúc, xóa đi và đá về login
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Xóa token trong két sắt
    router.push("/login"); // Đẩy về trang đăng nhập
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <nav className="bg-white border-b border-zinc-200 px-8 py-4 flex justify-between items-center">
        <div className="font-bold text-xl text-[#3F1B6B]">RentHub Dashboard</div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-600">
            Xin chào, <strong className="text-[#3F1B6B]">{fullName}</strong>
          </span>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* Nội dung trang chủ */}
      <main className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="bg-white p-8 rounded-[24px] shadow-sm border border-zinc-100 space-y-3">
          <h2 className="text-2xl font-bold text-zinc-900 animate-fadeIn">
            🎉 Đăng nhập thông luồng thành công!
          </h2>
          {/* 🌟 ĐÃ THÊM: Dòng chữ chào mừng tên user cá nhân hóa */}
          <p className="text-zinc-700 text-base font-medium">
            Chào mừng <span className="text-[#3F1B6B] font-bold">{fullName}</span> trở lại với RentHub! 👋
          </p>
          <p className="text-zinc-400 text-xs">
            Tài khoản của bạn đã được xác thực an toàn bằng JWT.
          </p>
        </div>
      </main>
    </div>
  );
}