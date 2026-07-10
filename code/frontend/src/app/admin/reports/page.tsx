"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { reportService } from "@/services/report-service";
import { ReportAnalyticsResponse, ReportResponse, ReportStatus } from "@/types/backend";
import { useToast } from "@/context/ToastContext";
import { Activity, AlertCircle, CheckCircle2, XCircle, Loader2, ChevronLeft, ChevronRight, FileText, Eye } from "lucide-react";

export default function AdminReportsPage() {
  const { triggerToast } = useToast();
  
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [analytics, setAnalytics] = useState<ReportAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;

  const [filters, setFilters] = useState({
    status: "",
    rentalId: "",
    productId: "",
    reporterId: "",
    reportedUserId: ""
  });

  const fetchAnalytics = async () => {
    try {
      const data = await reportService.getReportAnalyticsAdmin();
      setAnalytics(data);
    } catch (error) {
      console.error("Lỗi lấy thống kê khiếu nại:", error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params: any = { page, size };
      if (filters.status) params.status = filters.status;
      if (filters.rentalId) params.rentalId = Number(filters.rentalId);
      if (filters.productId) params.productId = Number(filters.productId);
      if (filters.reporterId) params.reporterId = Number(filters.reporterId);
      if (filters.reportedUserId) params.reportedUserId = Number(filters.reportedUserId);

      const res = await reportService.getAllReportsAdmin(params);
      setReports(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (error) {
      console.error("Lỗi lấy danh sách khiếu nại:", error);
      triggerToast("Không thể tải danh sách khiếu nại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);
  useEffect(() => { fetchReports(); }, [page, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const getStatusBadge = (status: ReportStatus) => {
    const map: Record<string, { label: string; cls: string }> = {
      PENDING: { label: "Chờ xử lý", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
      UNDER_REVIEW: { label: "Đang xem xét", cls: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
      RESOLVED: { label: "Đã giải quyết", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
      REJECTED: { label: "Bị từ chối", cls: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" },
    };
    const info = map[status] || { label: status, cls: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${info.cls}`}>{info.label}</span>;
  };

  const totalReports = analytics ? Object.values(analytics.byStatus).reduce((a, b) => a + b, 0) : 0;

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Quản lý khiếu nại</h1>
            <p className="text-sm text-secondary mt-1">Theo dõi và giải quyết các tranh chấp từ người dùng</p>
          </div>

          {/* Analytics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: <FileText className="w-4 h-4" />, label: "Tổng số", value: totalReports, cls: "bg-primary border-secondary text-secondary", valCls: "text-primary" },
              { icon: <Activity className="w-4 h-4" />, label: "Chờ xử lý", value: analytics?.byStatus["PENDING"] || 0, cls: "bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900 text-amber-700 dark:text-amber-400", valCls: "text-amber-800 dark:text-amber-300" },
              { icon: <AlertCircle className="w-4 h-4" />, label: "Đang xem xét", value: analytics?.byStatus["UNDER_REVIEW"] || 0, cls: "bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-400", valCls: "text-blue-800 dark:text-blue-300" },
              { icon: <CheckCircle2 className="w-4 h-4" />, label: "Đã giải quyết", value: analytics?.byStatus["RESOLVED"] || 0, cls: "bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400", valCls: "text-emerald-800 dark:text-emerald-300" },
              { icon: <XCircle className="w-4 h-4" />, label: "Bị từ chối", value: analytics?.byStatus["REJECTED"] || 0, cls: "bg-red-50 dark:bg-red-950 border-red-100 dark:border-red-900 text-red-700 dark:text-red-400", valCls: "text-red-800 dark:text-red-300" },
            ].map((card) => (
              <div key={card.label} className={`p-4 border rounded-xl flex flex-col gap-2 ${card.cls}`}>
                <div className="flex items-center gap-2">
                  {card.icon}
                  <span className="text-xs font-medium uppercase tracking-wider">{card.label}</span>
                </div>
                <span className={`text-2xl font-semibold ${card.valCls}`}>{card.value}</span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="p-4 bg-primary border border-secondary rounded-xl space-y-3">
            <h3 className="text-sm font-medium text-primary">Bộ lọc tìm kiếm</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-3 py-2 bg-primary border border-secondary rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="UNDER_REVIEW">Đang xem xét</option>
                <option value="RESOLVED">Đã giải quyết</option>
                <option value="REJECTED">Bị từ chối</option>
              </select>
              {(["rentalId", "productId", "reporterId", "reportedUserId"] as const).map((field) => (
                <input key={field} type="number" name={field} placeholder={
                  field === "rentalId" ? "ID Đơn thuê" : field === "productId" ? "ID Sản phẩm" : field === "reporterId" ? "ID Tố cáo" : "ID Bị Tố cáo"
                } value={filters[field]} onChange={handleFilterChange} className="w-full px-3 py-2 bg-primary border border-secondary rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-500" />
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-24 bg-primary border border-secondary rounded-xl flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
              <p className="text-sm text-secondary">Đang tải danh sách khiếu nại...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-24 bg-primary border border-secondary rounded-xl flex flex-col items-center justify-center">
              <p className="text-sm text-secondary">Không tìm thấy khiếu nại nào phù hợp.</p>
            </div>
          ) : (
            <div className="bg-primary border border-secondary rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-secondary border-b border-secondary">
                      {["ID", "Lý do", "ID Đơn/SP", "Tố cáo", "Bị Tố cáo", "Ngày tạo", "Trạng thái"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">{h}</th>
                      ))}
                      <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary">
                    {reports.map((item) => (
                      <tr key={item.id} className="hover:bg-tertiary transition-colors">
                        <td className="px-4 py-3 text-sm font-mono font-medium text-primary">#{item.id}</td>
                        <td className="px-4 py-3 text-sm text-secondary">{item.reason}</td>
                        <td className="px-4 py-3 text-sm text-secondary">
                          <span className="text-tertiary">Đơn:</span> #{item.rentalId}<br />
                          <span className="text-tertiary">SP:</span> #{item.productId}
                        </td>
                        <td className="px-4 py-3 text-sm text-secondary">#{item.reporterId}</td>
                        <td className="px-4 py-3 text-sm text-secondary">#{item.reportedUserId}</td>
                        <td className="px-4 py-3 text-sm text-secondary">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</td>
                        <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/admin/reports/${item.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950 dark:hover:bg-brand-900 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-medium transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-secondary flex items-center justify-between">
                  <span className="text-sm text-secondary">
                    Trang <span className="font-medium text-primary">{page + 1}</span> / {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary border border-secondary rounded-lg text-sm font-medium text-primary hover:bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft className="w-4 h-4" /> Trước
                    </button>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary border border-secondary rounded-lg text-sm font-medium text-primary hover:bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      Sau <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}
