"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import { authService } from "@/services/auth-service";
import { Button } from "@/components/base/buttons/button";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user-service";

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();

  useEffect(() => {
    if (!email) {
      router.push("/register");
      return;
    }
    // Fetch initial status to sync timer
    const fetchStatus = async () => {
      try {
        const res = await authService.getRegistrationStatus(email);
        if (res.verified) {
          router.push("/login");
        } else if (res.canResendIn > 0) {
          setTimeLeft(res.canResendIn);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchStatus();
  }, [email, router]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    setCanResend(false);
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      if (pastedData.length === 6) {
        inputRefs.current[5]?.focus();
      } else {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Vui lòng nhập đầy đủ 6 số OTP.");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const res = await authService.verifyRegisterOtp({ email, otp: otpCode });
      
      // Auto login logic equivalent to login-form
      localStorage.setItem("token", res.token);
      const profile = await userService.getMyProfile();
      login(res.token, profile);
      
      setShowToast(true);
      setTimeout(() => {
        if (profile.role === "ROLE_ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      }, 1500);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Xác thực thất bại. Vui lòng kiểm tra lại mã OTP!";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setError(null);
      setLoading(true);
      await authService.resendRegisterOtp({ email });
      setTimeLeft(60); // Resend interval protection
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Không thể gửi lại mã.");
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
        <span>Xác thực thành công. Đang đăng nhập...</span>
      </div>

      {/* Title block */}
      <div className="space-y-1 text-center">
        <h2 className="text-display-xs font-bold text-primary">Nhập mã xác thực</h2>
        <p className="text-sm text-secondary">
          Mã gồm 6 chữ số đã được gửi tới <br />
          <span className="font-semibold text-primary">{email}</span>
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 text-sm text-error-primary bg-error-primary border border-error rounded-xl text-center">
          {error}
        </div>
      )}

      {/* OTP Inputs */}
      <div className="flex justify-between gap-2" onPaste={handlePaste}>
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-secondary bg-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            autoFocus={idx === 0}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <Button
          onClick={handleSubmit}
          size="xl"
          color="primary"
          isLoading={loading || showToast}
          isDisabled={loading || showToast || otp.join("").length < 6}
          className="w-full"
        >
          Xác thực
        </Button>

        <div className="text-center text-sm">
          {!canResend ? (
            <span className="text-secondary">
              Gửi lại mã sau <span className="font-medium text-brand-600">{formatTime(timeLeft)}</span>
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="font-semibold text-brand-secondary hover:text-brand-primary hover:underline"
            >
              Gửi lại mã OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
