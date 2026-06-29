"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "../../services/auth.service";
import { useToast } from "../../context/ToastContext"; 

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { triggerToast } = useToast();
  
  const token = searchParams ? searchParams.get("token") : null;

  // KHỞI TẠO BIẾN CỜ HIỆU ĐỂ CHẶN CUỘC GỌI KÉP TỪ REACT STRICT MODE
  const isCalled = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    token ? "Đang tiến hành xác thực tài khoản của bạn..." : "Mã xác thực (Token) không hợp lệ hoặc đã bị thiếu!"
  );

  useEffect(() => {
    // 1. Nếu không có token, dừng lại luôn vì State ban đầu đã được định sẵn là 'error'
    if (!token) return;

    // 2. CHỐT CHẶN 1: Nếu hàm này đã từng được gọi rồi, chặn đứng không cho chạy xuống dưới
    if (isCalled.current) return;
    isCalled.current = true; // Đánh dấu đã kích hoạt luồng bắn API thành công

    // 3. Tiến hành gửi mã token xuống Spring Boot để kích hoạt
    authService.verifyEmail(token)
      .then(() => {
        setStatus("success");
        // Bắn luôn Toast tím chàm lơ lửng xuyên màn hình từ Context toàn cục
        triggerToast("Tài khoản RentHub của bạn đã kích hoạt thành công!");
        
        // Hoãn 2 giây để người dùng nhìn thấy thông báo rồi đá về trang Login
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      })
      .catch((err) => {
        // CHỐT CHẶN 2: Nếu bị ép vào catch do cuộc gọi lặp, kiểm tra nếu trạng thái đã là 'success' thì bỏ qua
        setStatus((currentStatus) => {
          if (currentStatus === "success") return "success";

          // Nếu thực sự lỗi ở ngay lần gọi đầu tiên thì mới cập nhật giao diện Đỏ (Error)
          const errMsg = err.response?.data?.message || "Mã xác thực đã hết hạn hoặc không tồn tại!";
          setMessage(errMsg);
          return "error";
        });
      });
  }, [token, router, triggerToast]);

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center space-y-6 border border-zinc-100">
      <div className="font-bold text-2xl text-[#3F1B6B] flex items-center justify-center gap-2">
        <span className="p-1.5 bg-[#3F1B6B] text-white rounded-lg text-xs tracking-wider">SO</span> RentHub
      </div>
      
      {/* TRẠNG THÁI 1: ĐANG XOAY VÒNG LOADING */}
      {status === "loading" && (
        <div className="space-y-4">
          <div className="w-10 h-10 border-4 border-[#3F1B6B] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-600 text-sm font-medium">{message}</p>
        </div>
      )}

      {/* TRẠNG THÁI 2: KÍCH HOẠT THẤT BẠI (LỖI) */}
      {status === "error" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✕</div>
          <p className="text-red-600 font-semibold text-sm px-2">{message}</p>
          
          <button 
            onClick={() => router.push("/register")} 
            className="text-sm font-bold text-[#3F1B6B] hover:underline cursor-pointer block mx-auto pt-2 mb-2"
          >
            Quay lại trang Đăng ký
          </button>

          {process.env.NODE_ENV === "development" && (
            <div className="pt-4 border-t border-dashed border-zinc-200 mt-4 flex flex-col items-center justify-center">
              <p className="text-xs text-zinc-400 mb-2 font-medium">Chế độ Dev: Chưa nhận được email?</p>
              <a 
                href="http://localhost:1080" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-200 hover:bg-amber-100 transition-all font-semibold shadow-xs cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L22 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Mở nhanh Hòm thư Maildev
              </a>
            </div>
          )}
        </div>
      )}

      {/* TRẠNG THÁI 3: KÍCH HOẠT THÀNH CÔNG */}
      {status === "success" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
          <p className="text-emerald-600 font-semibold text-sm">Xác thực thành công! Đang chuyển hướng...</p>
        </div>
      )}
    </div>
  );
}

// Bọc Suspense để tránh lỗi "useSearchParams() should be wrapped in a suspense boundary" của Next.js khi build production
export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen w-full flex bg-zinc-100 items-center justify-center p-4 font-sans relative overflow-hidden">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center text-sm text-zinc-500">
          Đang tải tài nguyên hệ thống...
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}