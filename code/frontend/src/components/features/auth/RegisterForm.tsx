"use client";

import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterInput, RegisterSchema } from "../../../schemas/auth.schema";
import { authService } from "../../../services/auth.service";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setError(null);
      setLoading(true);
      const res = await authService.register(data);

      console.log("Response thô nhận từ API:", res);
      setShowToast(true);
      
      setTimeout(() => {
        router.push(`/verify-email?email=${data.email}`);
      }, 1500);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Đăng ký thất bại. Vui lòng kiểm tra lại!";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm relative">
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
        <span>Đăng ký thành công! Đang chuyển đến trang xác thực...</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div className="space-y-1 mb-5">
          <h2 className="text-3xl font-bold text-zinc-900">
            Đăng ký tài khoản
          </h2>
          <p className="text-sm text-zinc-500">
            Khám phá không gian chia sẻ đồ dùng RentHub
          </p>
        </div>

        {error && (
          <div className="p-3 mb-2 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 animate-fadeIn">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Họ và tên
          </label>
          <input
            {...register("fullName")}
            type="text"
            placeholder="Nguyễn Văn A"
            className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3F1B6B] text-zinc-900 placeholder-zinc-400 text-sm transition-all ${
              errors.fullName
                ? "border-red-500 focus:ring-red-500"
                : "border-zinc-300"
            }`}
          />
          <div className="h-5 mt-1">
            <p
              className={`text-xs text-red-500 transition-opacity duration-200 ${
                errors.fullName ? "opacity-100" : "opacity-0 select-none"
              }`}
            >
              {errors.fullName?.message || "Giữ chỗ"}
            </p>
          </div>
        </div>

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

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Mật khẩu
          </label>
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

        <button
          type="submit"
          disabled={loading || showToast}
          className="w-full py-3 bg-[#3F1B6B] hover:bg-[#2D134D] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm disabled:bg-zinc-400 cursor-pointer pt-2"
        >
          {loading ? "Đang xử lý..." : "Đăng ký ngay"}
        </button>

        <div className="text-center text-sm text-zinc-600 pt-2">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#3F1B6B] hover:underline"
          >
            Đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}