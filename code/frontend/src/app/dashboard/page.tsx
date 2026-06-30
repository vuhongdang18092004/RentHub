"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user-service";
import { ProfileInput, ProfileSchema } from "@/schemas/profile-schema";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Form } from "@/components/base/form/form";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

function DashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams ? searchParams.get("tab") : null;
  const { triggerToast } = useToast();
  const { user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "profile">("overview");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    mode: "onSubmit",
  });

  // Sync tab from query param
  useEffect(() => {
    if (tab === "profile") {
      setActiveTab("profile");
    } else {
      setActiveTab("overview");
    }
  }, [tab]);

  // Pre-fill profile data from auth context user object
  useEffect(() => {
    if (user) {
      setValue("fullName", user.fullName);
      setValue("phone", user.phone || "");
      setValue("address", user.address || "");
      setValue("avatarUrl", user.avatarUrl || "");
    }
  }, [user, setValue]);

  // Refresh profile detail explicitly if needed
  useEffect(() => {
    if (activeTab === "profile") {
      const syncProfile = async () => {
        try {
          setLoadingProfile(true);
          await refreshProfile();
        } catch (error) {
          console.error("Lỗi đồng bộ hồ sơ:", error);
        } finally {
          setLoadingProfile(false);
        }
      };
      syncProfile();
    }
  }, [activeTab, refreshProfile]);

  const onUpdateProfile = async (data: ProfileInput) => {
    try {
      setSavingProfile(true);
      await userService.updateMyProfile({
        fullName: data.fullName,
        phone: data.phone,
        address: data.address || "",
        avatarUrl: data.avatarUrl || "",
      });

      // Sync AuthContext profile
      await refreshProfile();
      triggerToast("Cập nhật hồ sơ thành công!");
    } catch (error: any) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      const errMsg = error.response?.data?.message || "Cập nhật thất bại. Vui lòng kiểm tra lại!";
      triggerToast(errMsg);
    } finally {
      setSavingProfile(false);
    }
  };

  const fullName = user?.fullName || "Thành viên";

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {activeTab === "overview" ? (
          <div className="bg-primary p-8 rounded-[24px] shadow-lg border border-secondary space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              🎉 Đăng nhập thông luồng thành công!
            </h2>
            <p className="text-secondary text-base font-medium">
              Chào mừng <span className="text-brand-700 font-bold">{fullName}</span> trở lại với RentHub! 👋
            </p>
            <p className="text-quaternary text-xs">
              Tài khoản của bạn đã được xác thực an toàn bằng JWT và phân quyền thành công.
            </p>
          </div>
        ) : (
          <div className="bg-primary p-8 rounded-[24px] shadow-lg border border-secondary space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-primary">Hồ sơ cá nhân</h2>
              <p className="text-sm text-secondary">Cập nhật thông tin tài khoản của bạn</p>
            </div>

            {loadingProfile ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-secondary font-medium">Đang tải dữ liệu hồ sơ...</p>
              </div>
            ) : (
              <Form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
                <Input
                  {...register("fullName")}
                  label="Họ tên"
                  placeholder="Họ và tên của bạn"
                  type="text"
                  isRequired
                  error={errors.fullName?.message}
                />
                <Input
                  {...register("phone")}
                  label="Số điện thoại"
                  placeholder="Ví dụ: 0912345678"
                  type="text"
                  isRequired
                  error={errors.phone?.message}
                />
                <Input
                  {...register("address")}
                  label="Địa chỉ"
                  placeholder="Địa chỉ liên hệ"
                  type="text"
                  error={errors.address?.message}
                />
                <Input
                  {...register("avatarUrl")}
                  label="Avatar URL"
                  placeholder="Đường dẫn ảnh đại diện"
                  type="text"
                  error={errors.avatarUrl?.message}
                />
                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    color="primary"
                    isLoading={savingProfile}
                    isDisabled={savingProfile}
                  >
                    Cập nhật hồ sơ
                  </Button>
                </div>
              </Form>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-secondary">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}