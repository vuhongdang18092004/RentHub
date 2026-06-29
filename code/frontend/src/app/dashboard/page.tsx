"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/context/ToastContext";
import { userService } from "@/services/user-service";
import { ProfileInput, ProfileSchema } from "@/schemas/profile-schema";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Form } from "@/components/base/form/form";

export default function DashboardPage() {
  const router = useRouter();
  const { triggerToast } = useToast();
  const [fullName, setFullName] = useState<string>("Thành viên");
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

  // ROUTE GUARD & GREETING USERNAME INITIALIZATION
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("fullName");

    if (!token) {
      alert("Bạn chưa đăng nhập! Vui lòng quay lại.");
      router.push("/login");
      return;
    }

    if (storedName) {
      setFullName(storedName);
    } else {
      try {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const decodedPayload = JSON.parse(
            decodeURIComponent(
              atob(payloadBase64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
            )
          );
          const name = decodedPayload.fullName || decodedPayload.sub || "Thành viên";
          setFullName(name);
          localStorage.setItem("fullName", name);
        }
      } catch (error) {
        console.error("Lỗi giải mã thẻ thông hành JWT:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("fullName");
        router.push("/login");
      }
    }
  }, [router]);

  // FETCH PROFILE DATA WHEN PROFILE TAB IS ACTIVE
  useEffect(() => {
    if (activeTab === "profile") {
      const fetchProfile = async () => {
        try {
          setLoadingProfile(true);
          const profile = await userService.getMyProfile();
          setValue("fullName", profile.fullName);
          setValue("phone", profile.phone || "");
          setValue("address", profile.address || "");
          setValue("avatarUrl", profile.avatarUrl || "");
        } catch (error) {
          console.error("Lỗi lấy thông tin hồ sơ:", error);
          triggerToast("Không thể tải thông tin hồ sơ!");
        } finally {
          setLoadingProfile(false);
        }
      };
      fetchProfile();
    }
  }, [activeTab, setValue, triggerToast]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    router.push("/login");
  };

  const onUpdateProfile = async (data: ProfileInput) => {
    try {
      setSavingProfile(true);
      const updated = await userService.updateMyProfile({
        fullName: data.fullName,
        phone: data.phone,
        address: data.address || "",
        avatarUrl: data.avatarUrl || "",
      });

      // Update local storage and greeting header
      localStorage.setItem("fullName", updated.fullName);
      setFullName(updated.fullName);
      triggerToast("Cập nhật hồ sơ thành công!");
    } catch (error: any) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      const errMsg = error.response?.data?.message || "Cập nhật thất bại. Vui lòng kiểm tra lại!";
      triggerToast(errMsg);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary font-sans">
      {/* Top Header Navigation */}
      <nav className="bg-primary border-b border-secondary px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="font-bold text-xl text-brand-700">RentHub Dashboard</div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === "overview"
                  ? "bg-brand-50 text-brand-700"
                  : "text-secondary hover:bg-tertiary"
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === "profile"
                  ? "bg-brand-50 text-brand-700"
                  : "text-secondary hover:bg-tertiary"
              }`}
            >
              Hồ sơ cá nhân
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-secondary">
            Xin chào, <strong className="text-brand-700">{fullName}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-error-primary text-error-primary hover:bg-red-100 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto p-8">
        {activeTab === "overview" ? (
          <div className="bg-primary p-8 rounded-[24px] shadow-lg border border-secondary space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              🎉 Đăng nhập thông luồng thành công!
            </h2>
            <p className="text-secondary text-base font-medium">
              Chào mừng <span className="text-brand-700 font-bold">{fullName}</span> trở lại với RentHub! 👋
            </p>
            <p className="text-quaternary text-xs">
              Tài khoản của bạn đã được xác thực an toàn bằng JWT.
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
                {/* Full Name */}
                <Input
                  {...register("fullName")}
                  label="Họ tên"
                  placeholder="Họ và tên của bạn"
                  type="text"
                  isRequired
                  error={errors.fullName?.message}
                />

                {/* Phone */}
                <Input
                  {...register("phone")}
                  label="Số điện thoại"
                  placeholder="Ví dụ: 0912345678"
                  type="text"
                  isRequired
                  error={errors.phone?.message}
                />

                {/* Address */}
                <Input
                  {...register("address")}
                  label="Địa chỉ"
                  placeholder="Địa chỉ liên hệ"
                  type="text"
                  error={errors.address?.message}
                />

                {/* Avatar URL */}
                <Input
                  {...register("avatarUrl")}
                  label="Avatar URL"
                  placeholder="Đường dẫn ảnh đại diện"
                  type="text"
                  error={errors.avatarUrl?.message}
                />

                {/* Submit Action */}
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
      </main>
    </div>
  );
}