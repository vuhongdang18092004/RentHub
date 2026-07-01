"use client";

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

function ProfileContent() {
  const { triggerToast } = useToast();
  const { user, refreshProfile } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    mode: "onSubmit",
  });

  // Pre-fill profile data
  useEffect(() => {
    if (user) {
      setValue("fullName", user.fullName);
      setValue("phone", user.phone || "");
      setValue("address", user.address || "");
      setValue("avatarUrl", user.avatarUrl || "");
      if (user.avatarUrl) {
        setAvatarPreview(user.avatarUrl);
      }
    }
  }, [user, setValue]);

  // Sync profile details on mount
  useEffect(() => {
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
  }, [refreshProfile]);

  // Cloudinary signature-based upload helper
  const uploadAvatarToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cấu hình Cloudinary thiếu trong file .env");
    }

    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const stringToSign = `timestamp=${timestamp}${apiSecret}`;
    const buffer = new TextEncoder().encode(stringToSign);
    const hash = await crypto.subtle.digest("SHA-1", buffer);
    const signature = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "Tải ảnh thất bại");
    }

    const resData = await response.json();
    return resData.secure_url;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingAvatar(true);
      const url = await uploadAvatarToCloudinary(files[0]);
      setAvatarPreview(url);
      setValue("avatarUrl", url);
      triggerToast("Tải ảnh đại diện lên thành công! Nhấn 'Lưu thay đổi' để lưu. 📸");
    } catch (err: any) {
      console.error("Lỗi upload avatar:", err);
      triggerToast(`Lỗi tải ảnh: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onUpdateProfile = async (data: ProfileInput) => {
    try {
      setSavingProfile(true);
      await userService.updateMyProfile({
        fullName: data.fullName,
        phone: data.phone,
        address: data.address || "",
        avatarUrl: data.avatarUrl || "",
      });

      await refreshProfile();
      triggerToast("Cập nhật thông tin cá nhân thành công! 🎉");
    } catch (error: any) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      const errMsg = error.response?.data?.message || "Cập nhật thất bại. Vui lòng kiểm tra lại!";
      triggerToast(errMsg);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[960px] mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900">
            👤 Thông tin cá nhân
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Quản lý thông tin tài khoản, ảnh đại diện và địa chỉ của bạn
          </p>
        </div>

        {loadingProfile ? (
          <div className="py-24 bg-white border border-zinc-200 rounded-3xl flex flex-col items-center justify-center gap-4 shadow-sm">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-zinc-500 font-semibold">Đang tải hồ sơ của bạn...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Avatar & Account Metadata Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 flex flex-col items-center text-center space-y-5">
                
                {/* Avatar with interactive hover state */}
                <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-violet-50 bg-zinc-50 shadow-md">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-violet-400 bg-violet-50">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Upload overlay */}
                  <label className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white cursor-pointer select-none text-[11px] font-bold">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={uploadingAvatar}
                    />
                    {uploadingAvatar ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span className="text-lg">📷</span>
                        <span>Đổi ảnh đại diện</span>
                      </>
                    )}
                  </label>
                </div>

                {/* Name & Role */}
                <div>
                  <h3 className="text-lg font-black text-zinc-900">{user?.fullName}</h3>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-100">
                    🛡 {user?.role === "ROLE_ADMIN" ? "Quản trị viên" : "Người dùng"}
                  </div>
                </div>

                {/* Account Details Read-Only list */}
                <div className="w-full border-t border-zinc-100 pt-5 space-y-3.5 text-left text-xs font-sans">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Email đăng nhập</span>
                    <span className="font-semibold text-zinc-800 truncate max-w-[160px]" title={user?.email}>
                      {user?.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Trạng thái tài khoản</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-50 text-green-700 border border-green-150">
                      ● Hoạt động
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Ngày tham gia</span>
                    <span className="font-semibold text-zinc-700">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Profile Edit Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900">✏ Chỉnh sửa thông tin</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Thay đổi các thông tin hiển thị và địa chỉ liên lạc của bạn</p>
                </div>

                <Form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      {...register("fullName")}
                      label="Họ và tên"
                      placeholder="Nhập họ và tên của bạn"
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
                  </div>

                  <Input
                    {...register("address")}
                    label="Địa chỉ giao hàng / nhận đồ"
                    placeholder="Địa chỉ cụ thể (số nhà, đường, quận/huyện, tỉnh/thành phố)"
                    type="text"
                    error={errors.address?.message}
                  />

                  {/* Hidden Input to store avatarUrl in Form State */}
                  <input type="hidden" {...register("avatarUrl")} />

                  <div className="pt-4 border-t border-zinc-100 flex justify-end">
                    <Button
                      type="submit"
                      size="lg"
                      color="primary"
                      isLoading={savingProfile}
                      isDisabled={savingProfile || uploadingAvatar}
                    >
                      Lưu thay đổi
                    </Button>
                  </div>
                </Form>
              </div>
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-secondary">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <ProfileContent />
      </Suspense>
    </ProtectedRoute>
  );
}
