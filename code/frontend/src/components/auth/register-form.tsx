"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { RegisterInput, RegisterSchema } from "@/schemas/register-schema";
import { authService } from "@/services/auth-service";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Form } from "@/components/base/form/form";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
      const res = await authService.register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });

      setShowToast(true);

      setTimeout(() => {
        const fallbackRes = (res as unknown) as Record<string, unknown>;
        const nestedData = fallbackRes.data as Record<string, unknown> | undefined;
        const tokenValue = res.token || (nestedData?.token as string | undefined);

        router.push(`/verify-email?token=${tokenValue || ""}`);
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
    <div className="w-full max-w-sm mx-auto relative space-y-6">
      {/* Toast Notification */}
      <div
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-brand-800 border border-brand-700 text-white px-6 py-3.5 rounded-2xl shadow-xl font-medium text-sm transition-all duration-500 ease-out ${
          showToast ? "translate-y-0 opacity-100" : "-translate-y-16 opacity-0 pointer-events-none"
        }`}
      >
        <svg
          className="w-5 h-5 animate-pulse text-brand-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        <span>Đăng ký thành công! Đang chuyển đến trang xác thực...</span>
      </div>

      {/* Title block */}
      <div className="space-y-1">
        <h2 className="text-display-xs font-bold text-primary">Tạo tài khoản</h2>
        <p className="text-sm text-secondary">
          Bắt đầu thuê và cho thuê trên RentHub
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 text-sm text-error-primary bg-error-primary border border-error rounded-xl">
          {error}
        </div>
      )}

      {/* Main Register Form */}
      <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <Input
          {...register("fullName")}
          label="Họ tên"
          placeholder="Nguyễn Văn A"
          type="text"
          isRequired
          error={errors.fullName?.message}
          autoComplete="name"
        />

        {/* Email Field */}
        <Input
          {...register("email")}
          label="Email"
          placeholder="you@example.com"
          type="email"
          isRequired
          error={errors.email?.message}
          autoComplete="email"
        />

        {/* Password Field */}
        <Input
          {...register("password")}
          label="Mật khẩu"
          placeholder="Tối thiểu 8 ký tự"
          type="password"
          isRequired
          error={errors.password?.message}
          autoComplete="new-password"
        />

        {/* Confirm Password Field */}
        <Input
          {...register("confirmPassword")}
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu"
          type="password"
          isRequired
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        {/* CTA Submit Button */}
        <Button
          type="submit"
          size="xl"
          color="primary"
          isLoading={loading || showToast}
          isDisabled={loading || showToast}
          className="w-full mt-2"
        >
          Đăng ký
        </Button>
      </Form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-secondary" />
        </div>
        <span className="relative px-3 text-xs text-quaternary bg-primary">
          hoặc
        </span>
      </div>

      {/* Social Login Buttons */}
      <div className="flex gap-3">
        <SocialButton brand="google" onButtonClick={() => console.log("Google Login")} />
        <SocialButton brand="apple" onButtonClick={() => console.log("Apple Login")} />
      </div>

      {/* Bottom Link */}
      <div className="text-center text-sm text-secondary pt-2">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-brand-secondary hover:text-brand-primary hover:underline">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
