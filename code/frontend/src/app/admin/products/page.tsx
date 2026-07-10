"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPrimaryImage } from "@/utils/image-utils";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import api from "@/lib/axios";
import { useToast } from "@/context/ToastContext";
import { productService } from "@/services/product-service";
import { CheckCircle, XCircle, RefreshCw, Loader2, Package, Inbox } from "lucide-react";

export default function AdminProductsPage() {
  const { triggerToast } = useToast();
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/products?status=PENDING");
      setPendingProducts(res.data.content || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách chờ duyệt:", error);
      triggerToast("Không thể tải danh sách sản phẩm chờ duyệt!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, [triggerToast]);

  const handleApproveProduct = async (id: number, name: string) => {
    try {
      await api.patch(`/admin/products/${id}/status`, { "status": "AVAILABLE" });
      triggerToast(`Đã duyệt sản phẩm "${name}"`);
      fetchPendingProducts();
    } catch (err) {
      console.error("Lỗi duyệt sản phẩm:", err);
      triggerToast("Không thể duyệt sản phẩm.");
    }
  };

  const handleRejectProduct = async (id: number, name: string) => {
    try {
      await api.patch(`/admin/products/${id}/status`, { status: "BLOCKED" });
      triggerToast(`Đã từ chối duyệt sản phẩm "${name}"`);
      fetchPendingProducts();
    } catch (err) {
      console.error("Lỗi từ chối sản phẩm:", err);
      triggerToast("Không thể từ chối sản phẩm.");
    }
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-primary">Phê duyệt sản phẩm</h1>
              <p className="text-sm text-secondary mt-1">
                Duyệt hoặc từ chối các mặt hàng người dùng đăng tải trước khi hiển thị công khai
              </p>
            </div>
            <button
              onClick={fetchPendingProducts}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary border border-secondary rounded-lg text-sm font-medium text-secondary hover:bg-tertiary transition-all duration-200 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>
          </div>

          <div className="bg-primary border border-secondary rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-secondary">
              <p className="text-sm font-medium text-secondary">
                Danh sách tin chờ duyệt ({pendingProducts.length})
              </p>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
                <p className="text-sm text-secondary">Đang tải danh sách chờ duyệt...</p>
              </div>
            ) : pendingProducts.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Inbox className="w-10 h-10 text-tertiary" />
                <p className="text-sm text-secondary">Không có sản phẩm nào cần phê duyệt.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary border-b border-secondary">
                      <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Hình ảnh</th>
                      <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Tên sản phẩm</th>
                      <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Giá thuê / ngày</th>
                      <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Danh mục</th>
                      <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Người đăng</th>
                      <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Phê duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary">
                    {pendingProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-tertiary transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-11 h-11 rounded-lg overflow-hidden border border-secondary bg-tertiary">
                            {getPrimaryImage(prod) ? (
                              <img src={getPrimaryImage(prod)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-tertiary">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-primary">
                          <Link href={`/products/${prod.id}`} className="hover:text-brand-600 transition-colors">
                            {prod.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-brand-600">
                          {Number(prod.pricePerDay).toLocaleString("vi-VN")}đ
                        </td>
                        <td className="px-4 py-3 text-sm text-secondary">
                          {prod.category?.name || prod.categoryName}
                        </td>
                        <td className="px-4 py-3 text-sm text-secondary">
                          {prod.ownerName || "Người dùng"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleApproveProduct(prod.id, prod.name)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-sm transition-all duration-200 cursor-pointer"
                              title="Duyệt cho thuê"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Phê duyệt
                            </button>
                            <button
                              onClick={() => handleRejectProduct(prod.id, prod.name)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium shadow-sm transition-all duration-200 cursor-pointer"
                              title="Từ chối duyệt"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Từ chối
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}
