"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import api from "@/lib/axios";
import { useToast } from "@/context/ToastContext";
import { ExportButton } from "@/components/admin/ExportButton";
import { Loader2, Eye } from "lucide-react";

interface Payment {
  id: number;
  rentalId: number;
  payerId: number;
  payeeId: number;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  status: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const { triggerToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payments");
      const list = (res.data.content || []).map((p: any) => ({
        id: p.id,
        rentalId: p.rentalId,
        payerId: p.payerId,
        payeeId: p.payeeId || 0,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        paymentType: p.paymentType,
        status: p.status,
        createdAt: p.paidAt || p.createdAt || ""
      }));
      setPayments(list);
    } catch (error) {
      console.error("Payments fetch error:", error);
      triggerToast("Không thể tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [triggerToast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
      case "PENDING": return "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
      case "FAILED": return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400";
      default: return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "DEPOSIT": return { label: "Đặt cọc", cls: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400" };
      case "RENTAL_PAYMENT": return { label: "Thanh toán", cls: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400" };
      case "REFUND": return { label: "Hoàn tiền", cls: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400" };
      default: return { label: type, cls: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" };
    }
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-primary">Quản lý Dòng Tiền</h1>
              <p className="text-sm text-secondary mt-1">Giám sát các khoản thanh toán, cọc và hoàn tiền</p>
            </div>
            <ExportButton endpoint="/admin/export/payments" filename="payments.csv" label="Xuất CSV" />
          </div>

          <div className="bg-primary border border-secondary rounded-xl shadow-sm overflow-hidden">
            {/* Filter bar */}
            <div className="px-4 py-3 border-b border-secondary flex flex-wrap items-center gap-3">
              <input 
                type="text" 
                placeholder="Mã giao dịch..." 
                className="px-3 py-2 border border-secondary rounded-lg text-sm bg-primary text-primary w-52 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              />
              <select className="px-3 py-2 border border-secondary rounded-lg text-sm bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Tất cả loại giao dịch</option>
                <option value="DEPOSIT">Đặt cọc</option>
                <option value="RENTAL_PAYMENT">Thanh toán thuê</option>
                <option value="REFUND">Hoàn tiền</option>
              </select>
              <select className="px-3 py-2 border border-secondary rounded-lg text-sm bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Tất cả trạng thái</option>
                <option value="SUCCESS">Thành công</option>
                <option value="PENDING">Đang xử lý</option>
                <option value="FAILED">Thất bại</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary border-b border-secondary">
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Mã GD</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Loại GD</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Phương thức</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Số Tiền</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Thời Gian</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Trạng Thái</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto" />
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center text-sm text-secondary">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => {
                      const typeInfo = getTypeLabel(payment.paymentType);
                      return (
                        <tr key={payment.id} className="hover:bg-tertiary transition-colors">
                          <td className="px-4 py-3 text-sm font-mono font-medium text-primary">#{payment.id}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.cls}`}>
                              {typeInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-secondary">{payment.paymentMethod}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-primary">
                            {payment.amount.toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="px-4 py-3 text-sm text-secondary">
                            {new Date(payment.createdAt).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-sm font-medium transition-colors">
                              <Eye className="w-4 h-4" />
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
