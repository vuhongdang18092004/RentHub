"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPrimaryImage } from "@/utils/image-utils";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { productService, ProductSummary } from "@/services/product-service";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Plus, Package, Loader2, Image as ImageIcon, Pencil, Trash2, Box } from "lucide-react";

export default function MyProductsPage() {
  const { triggerToast } = useToast();
  const { role } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin Route Restriction check
  useEffect(() => {
    if (role === "ROLE_ADMIN") {
      router.replace("/admin/users");
    }
  }, [role, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productService.getMyProducts();
        setProducts(res.content);
      } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error);
        triggerToast("Không thể tải danh sách sản phẩm cá nhân!");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [triggerToast]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await productService.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      triggerToast("Xóa sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      triggerToast("Xóa sản phẩm thất bại!");
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Header section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-primary">Kho đồ của tôi</h1>
              <p className="text-sm text-secondary mt-1">Quản lý danh sách các mặt hàng cho thuê của bạn</p>
            </div>
            <Link
              href="/products/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              Đăng tin mới
            </Link>
          </div>

          {/* List Section */}
          {loading ? (
            <div className="py-20 bg-primary border border-secondary rounded-xl flex flex-col items-center justify-center gap-4 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
              <p className="text-sm text-secondary font-medium">Đang tải danh sách đồ dùng...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 bg-primary border border-secondary rounded-xl flex flex-col items-center justify-center gap-4 text-center px-6 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary">
                <Box className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-primary">Chưa có sản phẩm nào</h3>
                <p className="text-sm text-secondary">Bạn chưa đăng tải bất kỳ mặt hàng cho thuê nào trên hệ thống.</p>
              </div>
              <Link
                href="/products/create"
                className="mt-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Đăng tin cho thuê ngay
              </Link>
            </div>
          ) : (
            <div className="bg-primary border border-secondary rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary border-b border-secondary">
                      <th className="px-6 py-3.5 text-xs font-semibold text-secondary uppercase tracking-wider">Hình ảnh</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-secondary uppercase tracking-wider">Tên sản phẩm</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-secondary uppercase tracking-wider">Danh mục</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-secondary uppercase tracking-wider">Giá thuê / ngày</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-secondary uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-tertiary transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-lg border border-secondary bg-secondary overflow-hidden flex items-center justify-center shrink-0">
                            {getPrimaryImage(product) ? (
                              <img
                                src={getPrimaryImage(product)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-tertiary" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-sm text-primary">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-secondary">{product.category.name}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-brand-600 dark:text-brand-400">
                          {product.pricePerDay.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded text-xs font-medium ${
                              product.status === "AVAILABLE"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                : product.status === "RENTED"
                                ? "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                                : product.status === "PENDING"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                : product.status === "BLOCKED"
                                ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                                : "bg-secondary text-secondary"
                            }`}
                          >
                            {product.status === "AVAILABLE"
                              ? "Sẵn sàng"
                              : product.status === "RENTED"
                              ? "Đang thuê"
                              : product.status === "PENDING"
                              ? "Chờ duyệt"
                              : product.status === "BLOCKED"
                              ? "Bị khóa"
                              : "Đã ẩn"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {product.status !== "RENTED" && (
                              <Link
                                href={`/products/${product.id}/edit`}
                                className="p-2 text-secondary hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/50 rounded-lg transition-colors"
                                title="Sửa tin"
                              >
                                <Pencil className="w-4 h-4" />
                              </Link>
                            )}
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                              title="Xóa tin"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
