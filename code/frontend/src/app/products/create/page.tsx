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
import { AlertTriangle, Loader2, ImagePlus, Star, Trash2, Link } from "lucide-react";

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
  const { role, user } = useAuth();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ imageUrl: string; isPrimary: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const hasBankInfo = !!(user?.bankAccountNumber && user?.bankCode);

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
  }, [triggerToast]);

  // Helper to upload images to Cloudinary with browser-side signature computation
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret || cloudName === "YOUR_CLOUD_NAME" || apiKey === "YOUR_API_KEY" || apiSecret === "YOUR_API_SECRET") {
      console.warn("Cloudinary chưa được cấu hình. Sử dụng ảnh demo thay thế.");
      return `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;
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
      triggerToast(`Đã tải lên thành công ${newUrls.length} ảnh!`);
    }
    setUploading(false);
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setUploadedImages((prev) => {
      const isPrimary = prev.length === 0;
      return [...prev, { imageUrl: imageUrlInput.trim(), isPrimary }];
    });
    setImageUrlInput("");
    triggerToast("Đã thêm ảnh từ URL thành công!");
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

          {!hasBankInfo && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-500 text-sm flex items-start gap-3 shadow-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <p className="font-bold">Bạn chưa cập nhật tài khoản ngân hàng nhận tiền!</p>
                <p className="text-xs mt-1">
                  Để duyệt yêu cầu thuê của khách hàng, vui lòng{" "}
                  <a href="/profile" className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-400">
                    cập nhật tài khoản ngân hàng nhận tiền tại đây
                  </a>.
                </p>
              </div>
            </div>
          )}

          <div className="bg-primary p-6 md:p-8 rounded-2xl shadow-sm border border-secondary">
            {loadingCategories ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                <p className="text-sm text-secondary font-medium">Đang tải danh mục...</p>
              </div>
            ) : (
              <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
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
                  <label className="text-sm font-semibold text-primary flex items-center gap-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("categoryId", { required: "Danh mục là bắt buộc" })}
                    className="w-full px-4 py-2.5 rounded-xl border border-secondary bg-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors cursor-pointer"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                     <p className="text-xs text-red-500 font-medium mt-1">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary flex items-center gap-1">
                    Địa chỉ giao nhận <span className="text-red-500">*</span>
                  </label>
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
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {errors.address.message}
                    </p>
                  )}

                  {watch("latitude") && watch("longitude") && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-secondary shadow-sm">
                      <LocationMapPreview 
                        latitude={watch("latitude")!} 
                        longitude={watch("longitude")!} 
                      />
                    </div>
                  )}
                </div>

                {/* Cloudinary Multiple Image Uploader */}
                <div className="space-y-3 font-sans">
                  <label className="text-sm font-semibold text-primary flex items-center gap-1">
                    Hình ảnh sản phẩm <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Existing uploaded images */}
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-secondary bg-secondary relative group shadow-sm">
                        <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                        
                        {/* Control overlay on hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(idx)}
                            className={`p-2 rounded-full transition-colors cursor-pointer ${
                              img.isPrimary ? "bg-amber-500 text-white" : "bg-white text-zinc-700 hover:bg-zinc-100"
                            }`}
                            title={img.isPrimary ? "Ảnh chính" : "Đặt làm ảnh chính"}
                          >
                            <Star className={`w-4 h-4 ${img.isPrimary ? "fill-current" : ""}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                            title="Xóa ảnh"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {img.isPrimary && (
                          <span className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded shadow-sm uppercase tracking-wider">
                            Ảnh chính
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Upload box */}
                    <label className="aspect-square rounded-xl border-2 border-dashed border-secondary hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/20 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 group relative shadow-sm">
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
                          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                          <span className="text-xs font-semibold text-brand-600">Đang tải...</span>
                        </>
                      ) : (
                        <>
                          <div className="p-3 rounded-full bg-secondary text-tertiary group-hover:bg-brand-100 dark:group-hover:bg-brand-900 group-hover:text-brand-600 transition-colors">
                            <ImagePlus className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-semibold text-secondary group-hover:text-brand-600">Thêm ảnh</span>
                        </>
                      )}
                    </label>
                  </div>

                  {uploadedImages.length === 0 && (
                    <p className="text-xs text-red-500 font-medium mt-1">Vui lòng tải lên ít nhất 1 ảnh sản phẩm</p>
                  )}

                  {/* Add URL input */}
                  <div className="flex items-center gap-2 mt-4">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Link className="h-4 w-4 text-tertiary" />
                      </div>
                      <input
                        type="text"
                        placeholder="Hoặc dán đường dẫn (URL) hình ảnh vào đây..."
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-secondary bg-primary focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={!imageUrlInput.trim()}
                      className="px-4 py-2.5 bg-secondary hover:bg-tertiary text-primary text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      Thêm URL
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-sm font-semibold text-primary">Mô tả chi tiết</label>
                  <textarea
                    {...register("description")}
                    placeholder="Mô tả hiện trạng sản phẩm, chính sách đền bù và hướng dẫn sử dụng..."
                    className="w-full px-4 py-3 rounded-xl border border-secondary bg-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors min-h-[120px] resize-y"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-6 border-t border-secondary flex justify-end gap-3">
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
