"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { productService, ProductSummary } from "@/services/product-service";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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
        <div className="space-y-6">
          
          {/* Header section */}
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-primary">Kho đồ của tôi</h1>
              <p className="text-sm text-secondary">Quản lý danh sách các mặt hàng cho thuê của bạn</p>
            </div>
            <Link
              href="/products/create"
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Đăng tin mới
            </Link>
          </div>

          {/* List Section */}
          {loading ? (
            <div className="py-24 bg-primary border border-secondary rounded-[24px] flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-secondary font-medium">Đang tải danh sách đồ dùng...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 bg-primary border border-secondary rounded-[24px] flex flex-col items-center justify-center gap-4 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-primary">Chưa có sản phẩm nào</h3>
                <p className="text-xs text-secondary">Bạn chưa đăng tải bất kỳ mặt hàng cho thuê nào trên hệ thống.</p>
              </div>
              <Link
                href="/products/create"
                className="mt-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Đăng tin cho thuê ngay
              </Link>
            </div>
          ) : (
            <div className="bg-primary border border-secondary rounded-[24px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary border-b border-secondary">
                      <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider">Hình ảnh</th>
                      <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider">Tên sản phẩm</th>
                      <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider">Danh mục</th>
                      <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider">Giá thuê / ngày</th>
                      <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-secondary transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-lg bg-tertiary overflow-hidden flex items-center justify-center shrink-0">
                            {product.primaryImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.primaryImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg className="w-6 h-6 text-quaternary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-sm text-primary">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-secondary">{product.category.name}</td>
                        <td className="px-6 py-4 text-sm font-bold text-brand-700">
                          {product.pricePerDay.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                              product.status === "AVAILABLE"
                                ? "bg-green-50 text-green-700"
                                : product.status === "RENTED"
                                ? "bg-orange-50 text-orange-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {product.status === "AVAILABLE"
                              ? "Sẵn sàng"
                              : product.status === "RENTED"
                              ? "Đang thuê"
                              : "Đã ẩn"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-error-primary hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa tin"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
