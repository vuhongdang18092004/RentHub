"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AnalyticsCard } from "@/components/admin/AnalyticsCard";
import { RiskBadge } from "@/components/admin/RiskBadge";
import api from "@/lib/axios";
import { useToast } from "@/context/ToastContext";
import { AlertTriangle, ShieldAlert, TrendingDown, Inbox, Loader2 } from "lucide-react";

export default function AdminRiskAnalyticsPage() {
  const { triggerToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState<any>(null);

  useEffect(() => {
    const fetchRiskAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/risk/analytics");
        setRiskData(res.data);
      } catch (error) {
        console.error("Risk Analytics fetch error:", error);
        triggerToast("Không thể tải dữ liệu phân tích rủi ro");
      } finally {
        setLoading(false);
      }
    };
    fetchRiskAnalytics();
  }, [triggerToast]);

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6 w-full">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Phân tích rủi ro hệ thống</h1>
            <p className="text-sm text-secondary mt-1">Giám sát các chỉ số bất thường và hành vi đáng ngờ</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnalyticsCard
                  title="Người Dùng Rủi Ro Cao"
                  value={riskData?.highRiskUsers || 0}
                  icon={<AlertTriangle className="w-5 h-5" />}
                />
                <AnalyticsCard
                  title="Hoạt Động Đáng Ngờ"
                  value={riskData?.suspiciousActivities || 0}
                  icon={<ShieldAlert className="w-5 h-5" />}
                />
                <AnalyticsCard
                  title="Tỷ Lệ Hoàn Tiền"
                  value={`${riskData?.refundRate || 0}%`}
                  icon={<TrendingDown className="w-5 h-5" />}
                  trend={{ value: 0.5, label: "so với tháng trước", isPositive: false }}
                />
                <AnalyticsCard
                  title="Khiếu Nại Tồn Đọng"
                  value={riskData?.pendingReports || 0}
                  icon={<Inbox className="w-5 h-5" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Reported Users */}
                <div className="bg-primary border border-secondary rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-secondary">
                    <h3 className="text-base font-semibold text-primary">Top User Bị Report Nhiều Nhất</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-secondary border-b border-secondary">
                          <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Người dùng</th>
                          <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Số report</th>
                          <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Rủi ro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-secondary">
                        {riskData?.topReportedUsers.map((user: any) => (
                          <tr key={user.id} className="hover:bg-tertiary transition-colors">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-primary">{user.name}</div>
                              <div className="text-xs text-tertiary">{user.email}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-primary">{user.reportsCount}</td>
                            <td className="px-4 py-3 text-right">
                              <RiskBadge level={user.riskLevel} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* High Cancellation Owners */}
                <div className="bg-primary border border-secondary rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-secondary">
                    <h3 className="text-base font-semibold text-primary">Top Owner Hủy Đơn Thuê Nhiều</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-secondary border-b border-secondary">
                          <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Chủ sở hữu</th>
                          <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Số lần hủy</th>
                          <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Tỷ lệ hủy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-secondary">
                        {riskData?.topCancelledRentals.map((item: any) => (
                          <tr key={item.id} className="hover:bg-tertiary transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-primary">{item.owner}</td>
                            <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 font-medium">{item.cancellations}</td>
                            <td className="px-4 py-3 text-right">
                              <span className="px-2 py-0.5 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 rounded text-xs font-medium">
                                {item.rate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}
