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
import { UserCircle, Shield, Camera, Pencil, Landmark, Loader2 } from "lucide-react";

function ProfileContent() {
  const { triggerToast } = useToast();
  const { user, refreshProfile } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [banksList, setBanksList] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch("https://api.vietqr.io/v2/banks");
        const json = await res.json();
        if (json.code === "00" && Array.isArray(json.data)) {
          setBanksList(json.data.map((b: any) => ({ code: b.code, name: `${b.code} - ${b.shortName || b.name}` })));
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách ngân hàng từ VietQR:", err);
      }
    };
    fetchBanks();
  }, []);

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
      setValue("bankAccountNumber", user.bankAccountNumber || "");
      setValue("bankCode", user.bankCode || "");
      setValue("bankAccountHolderName", user.bankAccountHolderName || "");
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

    if (!cloudName || !apiKey || !apiSecret || cloudName === "YOUR_CLOUD_NAME" || apiKey === "YOUR_API_KEY" || apiSecret === "YOUR_API_SECRET") {
      console.warn("Cloudinary chưa được cấu hình. Sử dụng ảnh avatar demo.");
      return `https://picsum.photos/150/150?random=${Math.floor(Math.random() * 1000)}`;
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
      triggerToast("Tải ảnh đại diện lên thành công! Nhấn 'Lưu thay đổi' để lưu.");
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
        bankAccountNumber: data.bankAccountNumber || "",
        bankCode: data.bankCode || "",
        bankAccountHolderName: data.bankAccountHolderName || "",
      });

      await refreshProfile();
      triggerToast("Cập nhật thông tin cá nhân thành công!");
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
      <div className="max-w-7xl mx-auto space-y-6 w-full">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-brand-600" />
            Thông tin cá nhân
          </h1>
          <p className="text-sm text-secondary mt-1">
            Quản lý thông tin tài khoản, ảnh đại diện và địa chỉ của bạn
          </p>
        </div>

        {loadingProfile ? (
          <div className="py-24 bg-primary border border-secondary rounded-xl flex flex-col items-center justify-center gap-3 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            <p className="text-sm text-secondary font-medium">Đang tải hồ sơ của bạn...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Avatar & Account Metadata Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-primary rounded-xl border border-secondary shadow-sm p-6 flex flex-col items-center text-center">
                
                {/* Avatar with interactive hover state */}
                <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-secondary bg-tertiary shadow-sm mb-4">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-brand-400 bg-brand-50 dark:bg-brand-950">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Upload overlay */}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white cursor-pointer select-none text-[11px] font-medium">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={uploadingAvatar}
                    />
                    {uploadingAvatar ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 mb-1" />
                        <span>Đổi ảnh</span>
                      </>
                    )}
                  </label>
                </div>

                {/* Name & Role */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-primary">{user?.fullName}</h3>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400 border border-brand-100 dark:border-brand-900">
                    <Shield className="w-3.5 h-3.5" />
                    {user?.role === "ROLE_ADMIN" ? "Quản trị viên" : "Người dùng"}
                  </div>
                </div>

                {/* Account Details Read-Only list */}
                <div className="w-full border-t border-secondary pt-5 space-y-4 text-left text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary font-medium">Email đăng nhập</span>
                    <span className="text-primary font-medium truncate max-w-[150px]" title={user?.email}>
                      {user?.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary font-medium">Trạng thái</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Hoạt động
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary font-medium">Ngày tham gia</span>
                    <span className="text-primary font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Profile Edit Form */}
            <div className="lg:col-span-2">
              <div className="bg-primary rounded-xl border border-secondary shadow-sm p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-2 border-b border-secondary pb-4">
                  <Pencil className="w-5 h-5 text-brand-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-primary">Chỉnh sửa thông tin</h2>
                    <p className="text-sm text-secondary mt-0.5">Thay đổi các thông tin hiển thị và địa chỉ liên lạc của bạn</p>
                  </div>
                </div>

                <Form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

                  <div className="pt-6 border-t border-secondary space-y-5">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-brand-600" />
                      <div>
                        <h3 className="text-base font-semibold text-primary">Tài khoản ngân hàng nhận tiền</h3>
                        <p className="text-sm text-secondary mt-0.5">Tài khoản này sẽ nhận tiền khi có người thuê đồ của bạn.</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-sm font-medium text-secondary">Ngân hàng</label>
                      <select
                        {...register("bankCode")}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-secondary bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 transition-colors"
                      >
                        <option value="">-- Chọn ngân hàng --</option>
                        {banksList.map((bank) => (
                          <option key={bank.code} value={bank.code}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                      {errors.bankCode && (
                        <span className="text-xs text-red-500 font-medium">{errors.bankCode.message}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input
                        {...register("bankAccountNumber")}
                        label="Số tài khoản ngân hàng"
                        placeholder="Nhập số tài khoản"
                        type="text"
                        error={errors.bankAccountNumber?.message}
                      />
                      <Input
                        {...register("bankAccountHolderName")}
                        label="Tên chủ tài khoản"
                        placeholder="Ví dụ: NGUYEN VAN A"
                        type="text"
                        error={errors.bankAccountHolderName?.message}
                      />
                    </div>
                  </div>

                  {/* Hidden Input to store avatarUrl in Form State */}
                  <input type="hidden" {...register("avatarUrl")} />

                  <div className="pt-6 border-t border-secondary flex justify-end">
                    <Button
                      type="submit"
                      size="lg"
                      color="primary"
                      isLoading={savingProfile}
                      isDisabled={savingProfile || uploadingAvatar}
                      className="min-w-[140px]"
                    >
                      {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
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
        <div className="min-h-screen w-full flex items-center justify-center bg-primary">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      }>
        <ProfileContent />
      </Suspense>
    </ProtectedRoute>
  );
}
