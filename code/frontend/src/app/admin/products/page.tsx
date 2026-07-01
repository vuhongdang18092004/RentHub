"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import api from "@/lib/axios";
import { useToast } from "@/context/ToastContext";
import { productService } from "@/services/product-service";

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
      await api.put(`/admin/products/${id}/approve`);
      triggerToast(`Đã duyệt sản phẩm "${name}"! ✅`);
      fetchPendingProducts();
    } catch (err) {
      console.error("Lỗi duyệt sản phẩm:", err);
      triggerToast("Không thể duyệt sản phẩm.");
    }
  };

  const handleRejectProduct = async (id: number, name: string) => {
    try {
      await api.put(`/admin/products/${id}/reject`);
      triggerToast(`Đã từ chối duyệt sản phẩm "${name}". ❌`);
      fetchPendingProducts();
    } catch (err) {
      console.error("Lỗi từ chối sản phẩm:", err);
      triggerToast("Không thể từ chối sản phẩm.");
    }
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-primary">Phê duyệt sản phẩm</h1>
            <p className="text-sm text-secondary">
              Duyệt hoặc từ chối các mặt hàng người dùng đăng tải trước khi hiển thị công khai
            </p>
          </div>

          <div className="bg-primary p-6 rounded-[24px] shadow-lg border border-secondary space-y-4">
            <div className="flex justify-between items-center font-sans">
              <h3 className="text-sm font-bold text-primary">Danh sách tin chờ duyệt ({pendingProducts.length})</h3>
              <button
                onClick={fetchPendingProducts}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
              >
                Làm mới danh sách
              </button>
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-secondary font-medium">Đang tải danh sách chờ duyệt...</p>
              </div>
            ) : pendingProducts.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-secondary rounded-2xl">
                <p className="text-sm text-secondary font-medium">Không có sản phẩm nào cần phê duyệt. 🎉</p>
              </div>
            ) : (
              <div className="bg-white border border-secondary rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-secondary">
                        <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Hình ảnh</th>
                        <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Tên sản phẩm</th>
                        <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Giá thuê / ngày</th>
                        <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Danh mục</th>
                        <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Người đăng</th>
                        <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider text-right">Phê duyệt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/60">
                      {pendingProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-5 py-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50">
                              {prod.primaryImage ? (
                                <img src={prod.primaryImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3 font-bold text-xs text-primary">
                            <Link href={`/products/${prod.id}`} className="hover:underline hover:text-brand-700">
                              {prod.name}
                            </Link>
                          </td>
                          <td className="px-5 py-3 text-xs font-semibold text-violet-700">
                            {Number(prod.pricePerDay).toLocaleString("vi-VN")}đ
                          </td>
                          <td className="px-5 py-3 text-xs text-secondary font-mono">
                            {prod.category?.name || prod.categoryName}
                          </td>
                          <td className="px-5 py-3 text-xs text-secondary font-semibold">
                            {prod.ownerName || "Người dùng"}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleApproveProduct(prod.id, prod.name)}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-extrabold shadow-sm transition-all cursor-pointer"
                                title="Duyệt cho thuê"
                              >
                                Phê duyệt
                              </button>
                              <button
                                onClick={() => handleRejectProduct(prod.id, prod.name)}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-extrabold shadow-sm transition-all cursor-pointer"
                                title="Từ chối duyệt"
                              >
                                Từ chối
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
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}
