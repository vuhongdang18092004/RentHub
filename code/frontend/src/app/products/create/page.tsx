"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { productService } from "@/services/product-service";
import api from "@/lib/axios";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Form } from "@/components/base/form/form";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { LocationAutocomplete } from "@/components/location/location-autocomplete";
import { LocationMapPreview } from "@/components/location/location-map-preview";

interface CategoryOption {
  id: number;
  name: string;
}

interface CreateProductFormInput {
  name: string;
  description: string;
  pricePerDay: number;
  depositAmount: number;
  address: string;
  categoryId: string;
  latitude?: number | null;
  longitude?: number | null;
}

export default function CreateProductPage() {
  const router = useRouter();
  const { triggerToast } = useToast();
  const { role } = useAuth();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ imageUrl: string; isPrimary: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);

  // Admin Route Restriction check
  useEffect(() => {
    if (role === "ROLE_ADMIN") {
      router.replace("/admin/users");
    }
  }, [role, router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProductFormInput>({
    mode: "onSubmit",
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
        triggerToast("Không thể tải danh mục sản phẩm!");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Helper to upload images to Cloudinary with browser-side signature computation
  const uploadToCloudinary = async (file: File): Promise<string> => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadToCloudinary(files[i]);
        newUrls.push(url);
      } catch (err: any) {
        console.error("Lỗi upload Cloudinary:", err);
        triggerToast(`Lỗi tải ảnh ${files[i].name}: ${err.message}`);
      }
    }

    if (newUrls.length > 0) {
      setUploadedImages((prev) => {
        const updated = [...prev];
        newUrls.forEach((url) => {
          const isPrimary = updated.length === 0;
          updated.push({ imageUrl: url, isPrimary });
        });
        return updated;
      });
      triggerToast(`Đã tải lên thành công ${newUrls.length} ảnh! 📸`);
    }
    setUploading(false);
  };

  const setPrimaryImage = (index: number) => {
    setUploadedImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (prev[index]?.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const onSubmit = async (data: CreateProductFormInput) => {
    if (uploadedImages.length === 0) {
      triggerToast("Vui lòng tải lên ít nhất 1 ảnh!");
      return;
    }

    try {
      setSaving(true);
      
      const productData = {
        categoryId: parseInt(data.categoryId || "0"),
        name: data.name,
        description: data.description || "",
        pricePerDay: Number(data.pricePerDay || 0),
        depositAmount: Number(data.depositAmount || 0),
        address: data.address,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        images: uploadedImages,
      };

      await productService.createProduct(productData);
      triggerToast("Đăng tin sản phẩm thành công!");
      router.push("/products/my");
    } catch (error: any) {
      console.error("Lỗi đăng sản phẩm:", error);
      const errMsg = error.response?.data?.message || "Đăng tin thất bại. Vui lòng kiểm tra lại!";
      triggerToast(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-primary">Đăng sản phẩm mới</h1>
            <p className="text-sm text-secondary">Đăng mặt hàng của bạn lên hệ thống để cho thuê</p>
          </div>

          <div className="bg-primary p-8 rounded-[24px] shadow-lg border border-secondary">
            {loadingCategories ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-secondary font-medium">Đang tải danh mục...</p>
              </div>
            ) : (
              <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Product Name */}
                <Input
                  {...register("name", { required: "Tên sản phẩm là bắt buộc" })}
                  label="Tên sản phẩm"
                  placeholder="Ví dụ: Lều cắm trại 4 người Eureka"
                  type="text"
                  isRequired
                  error={errors.name?.message}
                />

                {/* Category Selection */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-xs font-semibold text-secondary flex items-center gap-1">
                    Danh mục <span className="text-error-primary">*</span>
                  </label>
                  <select
                    {...register("categoryId", { required: "Danh mục là bắt buộc" })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-primary text-sm font-medium focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <span className="text-xs font-semibold text-error-primary block mt-1">
                      {errors.categoryId.message}
                    </span>
                  )}
                </div>

                {/* Price per Day */}
                <Input
                  {...register("pricePerDay", {
                    required: "Giá thuê là bắt buộc",
                    min: { value: 1, message: "Giá thuê phải lớn hơn 0" },
                  })}
                  label="Giá thuê / ngày (đ)"
                  placeholder="Ví dụ: 120000"
                  type="number"
                  isRequired
                  error={errors.pricePerDay?.message}
                />

                {/* Deposit Amount */}
                <Input
                  {...register("depositAmount", {
                    required: "Tiền cọc là bắt buộc",
                    min: { value: 0, message: "Tiền cọc phải lớn hơn hoặc bằng 0" },
                  })}
                  label="Tiền đặt cọc (đ)"
                  placeholder="Ví dụ: 500000 (điền 0 nếu không cần cọc)"
                  type="number"
                  isRequired
                  error={errors.depositAmount?.message}
                />

                {/* Address */}
                <div className="space-y-4">
                  <input type="hidden" {...register("address", { required: "Địa chỉ là bắt buộc" })} />
                  <input type="hidden" {...register("latitude")} />
                  <input type="hidden" {...register("longitude")} />
                  
                  <LocationAutocomplete
                    onLocationSelect={(loc) => {
                      setValue("address", loc.address);
                      setValue("latitude", loc.latitude);
                      setValue("longitude", loc.longitude);
                    }}
                    defaultValue={watch("address")}
                    isRequired
                  />
                  
                  {errors.address && (
                    <p className="text-xs text-red-500 font-semibold mt-1">
                      ⚠️ {errors.address.message}
                    </p>
                  )}

                  {watch("latitude") && watch("longitude") && (
                    <div className="mt-4">
                      <LocationMapPreview 
                        latitude={watch("latitude")!} 
                        longitude={watch("longitude")!} 
                      />
                    </div>
                  )}
                </div>

                {/* Cloudinary Multiple Image Uploader */}
                <div className="space-y-3 font-sans">
                  <label className="text-xs font-semibold text-secondary">
                    Hình ảnh sản phẩm <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Existing uploaded images */}
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 relative group">
                        <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                        
                        {/* Control overlay on hover */}
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(idx)}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              img.isPrimary ? "bg-amber-500 text-white" : "bg-white text-zinc-700 hover:bg-zinc-100"
                            }`}
                            title={img.isPrimary ? "Ảnh chính" : "Đặt làm ảnh chính"}
                          >
                            ⭐
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                            title="Xóa ảnh"
                          >
                            🗑
                          </button>
                        </div>

                        {img.isPrimary && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-md shadow-sm uppercase tracking-wider">
                            Ảnh chính
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Upload box */}
                    <label className="aspect-[4/3] rounded-xl border-2 border-dashed border-zinc-300 hover:border-violet-500 bg-zinc-50 hover:bg-violet-50/20 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 group relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <>
                          <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[10px] font-semibold text-violet-600 animate-pulse">Đang tải...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
                          <span className="text-[10px] font-bold text-zinc-500 group-hover:text-violet-600">Thêm ảnh</span>
                          <span className="text-[8px] text-zinc-400">Tải lên Cloudinary</span>
                        </>
                      )}
                    </label>
                  </div>

                  {uploadedImages.length === 0 && (
                    <p className="text-[11px] text-red-500 font-semibold mt-1">Vui lòng tải lên ít nhất 1 ảnh sản phẩm</p>
                  )}
                </div>



                {/* Description */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-xs font-semibold text-secondary">Mô tả chi tiết</label>
                  <textarea
                    {...register("description")}
                    placeholder="Mô tả hiện trạng sản phẩm, chính sách đền bù và hướng dẫn sử dụng..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-primary text-sm font-medium focus:outline-none focus:border-brand-500 transition-colors min-h-[120px]"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    type="button"
                    size="lg"
                    color="secondary"
                    onClick={() => router.back()}
                    isDisabled={saving}
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    color="primary"
                    isLoading={saving}
                    isDisabled={saving}
                  >
                    Đăng tin cho thuê
                  </Button>
                </div>

              </Form>
            )}
          </div>

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
