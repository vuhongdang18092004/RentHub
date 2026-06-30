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
  primaryImageUrl: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const { triggerToast } = useToast();
  const { role } = useAuth();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);

  // Admin Route Restriction check
  useEffect(() => {
    if (role === "ROLE_ADMIN") {
      router.replace("/admin/users");
    }
  }, [role, router]);

  const {
    register,
    handleSubmit,
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

  const onSubmit = async (data: CreateProductFormInput) => {
    try {
      setSaving(true);
      
      const productData = {
        categoryId: parseInt(data.categoryId),
        name: data.name,
        description: data.description,
        pricePerDay: parseFloat(data.pricePerDay.toString()),
        depositAmount: parseFloat(data.depositAmount.toString()),
        address: data.address,
        latitude: null,
        longitude: null,
        images: data.primaryImageUrl
          ? [{ imageUrl: data.primaryImageUrl, isPrimary: true }]
          : [],
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
                <Input
                  {...register("address", { required: "Địa chỉ là bắt buộc" })}
                  label="Địa chỉ bàn giao"
                  placeholder="Địa chỉ bàn giao trực tiếp đồ dùng"
                  type="text"
                  isRequired
                  error={errors.address?.message}
                />

                {/* Primary Image URL */}
                <Input
                  {...register("primaryImageUrl", { required: "Đường dẫn ảnh là bắt buộc" })}
                  label="Đường dẫn ảnh chính sản phẩm"
                  placeholder="Đường dẫn link ảnh (HTTP/HTTPS)"
                  type="text"
                  isRequired
                  error={errors.primaryImageUrl?.message}
                />

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
