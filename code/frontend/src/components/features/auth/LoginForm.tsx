"use client";

import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginInput, LoginSchema } from "../../../schemas/auth.schema";
import { authService } from "../../../services/auth.service";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  onSuccess: (fullName: string) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter(); // KHỞI TẠO ROUTER
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loginName, setLoginName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setError(null);
      setLoading(true);
      
      const res = await authService.login(data);

      localStorage.setItem("token", res.token);

      setLoginName(res.fullName);
      setShowToast(true);

      setTimeout(() => {
        onSuccess(res.fullName);
      }, 1000);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại!";
      
      // CHỐT CHẶN: Kiểm tra xem lỗi trả về từ Spring Boot có chứa thông tin tài khoản chưa kích hoạt không
      if (
        axiosError.response?.status === 401 && 
        (errorMessage.includes("kích hoạt") || errorMessage.includes("PENDING") || errorMessage.includes("xác thực"))
      ) {
        setError("Tài khoản của bạn chưa được kích hoạt! Đang chuyển đến trang hỗ trợ xác thực...");
        
        // Hoãn 2 giây để người dùng đọc kịp thông báo lỗi rồi đẩy họ qua trang verify-email
        setTimeout(() => {
          router.push("/verify-email");
        }, 2000);
        return;
      }

      // Các lỗi sai mật khẩu hoặc tài khoản không tồn tại thông thường
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm relative">
      {/* TOAST THÔNG BÁO THÀNH CÔNG */}
      <div
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-500 ease-out flex items-center gap-3 bg-linear-to-r from-[#3F1B6B] to-indigo-900 text-white px-6 py-3.5 rounded-2xl shadow-xl font-medium text-sm border border-white/10 ${
          showToast
            ? "translate-y-0 opacity-100"
            : "-translate-y-16 opacity-0 pointer-events-none"
        }`}
      >
        <svg
          className="w-5 h-5 animate-pulse text-purple-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>Chào mừng {loginName} đã quay trở lại! Đang vào hệ thống...</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div className="space-y-1 mb-5">
          <h2 className="text-3xl font-bold text-zinc-900">Đăng nhập</h2>
          <p className="text-sm text-zinc-500">
            Chào mừng bạn quay lại với RentHub
          </p>
        </div>

        {/* CỤM HIỂN THỊ LỖI */}
        {error && (
          <div className="p-3 mb-2 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 animate-fadeIn">
            {error}
          </div>
        )}

        {/* INPUT EMAIL */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3F1B6B] text-zinc-900 placeholder-zinc-400 text-sm transition-all ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-zinc-300"
            }`}
          />
          <div className="h-5 mt-1">
            <p
              className={`text-xs text-red-500 transition-opacity duration-200 ${
                errors.email ? "opacity-100" : "opacity-0 select-none"
              }`}
            >
              {errors.email?.message || "Giữ chỗ"}
            </p>
          </div>
        </div>

        {/* INPUT MẬT KHẨU */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-zinc-700">
              Mật khẩu
            </label>
            <a href="#" className="text-xs text-zinc-500 hover:underline">
              Quên mật khẩu?
            </a>
          </div>
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3F1B6B] text-zinc-900 placeholder-zinc-400 text-sm transition-all ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-zinc-300"
            }`}
          />
          <div className="h-5 mt-1">
            <p
              className={`text-xs text-red-500 transition-opacity duration-200 ${
                errors.password ? "opacity-100" : "opacity-0 select-none"
              }`}
            >
              {errors.password?.message || "Giữ chỗ"}
            </p>
          </div>
        </div>

        {/* NÚT SUBMIT FORM */}
        <button
          type="submit"
          disabled={loading || showToast}
          className="w-full py-3 bg-[#3F1B6B] hover:bg-[#2D134D] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm disabled:bg-zinc-400 cursor-pointer pt-2"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>

        <div className="text-center text-sm text-zinc-600 pt-2">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#3F1B6B] hover:underline"
          >
            Đăng ký
          </Link>
        </div>
      </form>
    </div>
  );
}