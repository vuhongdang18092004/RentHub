"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import api from "@/lib/axios";
import { useToast } from "@/context/ToastContext";
import { ExportButton } from "@/components/admin/ExportButton";
import { Loader2, XCircle } from "lucide-react";

interface Rental {
  id: number;
  productId: number;
  productName: string;
  renterId: number;
  renterName: string;
  ownerId: number;
  ownerName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
}

export default function AdminRentalsPage() {
  const { triggerToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rentals, setRentals] = useState<Rental[]>([]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/rentals");
      const list = (res.data.content || []).map((r: any) => ({
        id: r.id,
        productId: r.product ? r.product.id : 0,
        productName: r.product ? r.product.name : "",
        renterId: r.renter ? r.renter.id : 0,
        renterName: r.renter ? r.renter.fullName : "",
        ownerId: r.owner ? r.owner.id : 0,
        ownerName: r.owner ? r.owner.fullName : "",
        startDate: r.startDate,
        endDate: r.endDate,
        totalPrice: r.totalPrice,
        status: r.status
      }));
      setRentals(list);
    } catch (error) {
      console.error("Rentals fetch error:", error);
      triggerToast("Không thể tải danh sách đơn thuê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [triggerToast]);

  const handleCancelRental = async (id: number) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn thuê #${id}?`)) {
      return;
    }
    try {
      await api.put(`/admin/rentals/${id}/cancel`);
      triggerToast("Đã hủy đơn thuê thành công!");
      fetchRentals();
    } catch (error) {
      console.error("Cancel rental error:", error);
      triggerToast("Hủy đơn thuê thất bại!");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
      case "PENDING": return "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
      case "CANCELLED": return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400";
      default: return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE": return "Đang thuê";
      case "COMPLETED": return "Hoàn thành";
      case "PENDING": return "Chờ duyệt";
      case "CANCELLED": return "Đã hủy";
      default: return status;
    }
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-primary">Quản lý Đơn Thuê</h1>
              <p className="text-sm text-secondary mt-1">Theo dõi tất cả giao dịch thuê trên hệ thống</p>
            </div>
            <ExportButton endpoint="/admin/export/rentals" filename="rentals.csv" label="Xuất CSV" />
          </div>

          <div className="bg-primary border border-secondary rounded-xl shadow-sm overflow-hidden">
            {/* Filter bar */}
            <div className="px-4 py-3 border-b border-secondary flex flex-wrap items-center gap-3">
              <input 
                type="text" 
                placeholder="Tìm kiếm theo ID..." 
                className="px-3 py-2 border border-secondary rounded-lg text-sm bg-primary text-primary w-52 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              />
              <select className="px-3 py-2 border border-secondary rounded-lg text-sm bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang thuê</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary border-b border-secondary">
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Mã Đơn</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Sản Phẩm</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Người Thuê</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Chủ Đồ</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Thời Gian</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Tổng Tiền</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Trạng Thái</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto" />
                      </td>
                    </tr>
                  ) : rentals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-sm text-secondary">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    rentals.map((rental) => (
                      <tr key={rental.id} className="hover:bg-tertiary transition-colors">
                        <td className="px-4 py-3 text-sm font-mono font-medium text-primary">#{rental.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-primary">{rental.productName}</td>
                        <td className="px-4 py-3 text-sm text-secondary">{rental.renterName}</td>
                        <td className="px-4 py-3 text-sm text-secondary">{rental.ownerName}</td>
                        <td className="px-4 py-3 text-sm text-secondary">
                          <span>{rental.startDate}</span>
                          <span className="text-tertiary mx-1">→</span>
                          <span>{rental.endDate}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-primary">
                          {rental.totalPrice.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                            {getStatusLabel(rental.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {rental.status !== "CANCELLED" && rental.status !== "COMPLETED" && (
                            <button 
                              onClick={() => handleCancelRental(rental.id)}
                              className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                              Hủy đơn
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}
