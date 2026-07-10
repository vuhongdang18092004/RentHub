"use client";

import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthHero } from "@/components/auth/auth-hero";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";

export default function VerifyEmailPage() {
  const hero = (
    <AuthHero
      image="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=1200&q=80"
      title="Xác thực Email"
      subtitle="Bảo mật tài khoản của bạn"
    />
  );

  return (
    <AuthLayout
      form={
        <Suspense fallback={<div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div></div>}>
          <VerifyOtpForm />
        </Suspense>
      }
      hero={hero}
    />
  );
}
