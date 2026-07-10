"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AnalyticsCard } from "@/components/admin/AnalyticsCard";
import { RevenueChart } from "@/components/admin/charts/RevenueChart";
import { StatusPieChart } from "@/components/admin/charts/StatusPieChart";
import { RecentActivityTable, ActivityItem } from "@/components/admin/RecentActivityTable";
import api from "@/lib/axios";
import { useToast } from "@/context/ToastContext";
import { DollarSign, ClipboardList, Package, Users, Loader2 } from "lucide-react";

interface DashboardOverview {
  totalUsers: number;
  totalProducts: number;
  totalRentals: number;
  totalRevenue: number;
  activeRentals: number;
  totalReports: number;
  totalReviews: number;
  pendingProducts: number;
  pendingReports: number;
  unreadNotifications: number;
}

export default function AdminDashboardPage() {
  const { triggerToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [revenueData, setRevenueData] = useState<{ date: string; amount: number }[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const overviewRes = await api.get("/admin/dashboard/overview");
        setOverview(overviewRes.data);

        // Fetch real payments to calculate revenue chart
        const paymentsRes = await api.get("/payments");
        const paymentsList = paymentsRes.data.content || [];
        const grouped: { [key: string]: number } = {};
        
        paymentsList.forEach((p: any) => {
          if (p.status === "SUCCESS") {
            const dateObj = new Date(p.paidAt || p.createdAt || Date.now());
            const dateStr = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
            grouped[dateStr] = (grouped[dateStr] || 0) + (p.amount || 0);
          }
        });

        const sortedChartData = Object.keys(grouped)
          .map(key => ({ date: key, amount: grouped[key] }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-7); // Get last 7 days

        setRevenueData(sortedChartData.length > 0 ? sortedChartData : [{ date: "Hôm nay", amount: 0 }]);

        // Fetch real activities
        const activitiesRes = await api.get("/admin/dashboard/recent-activities");
        const mappedActivities = (activitiesRes.data || []).map((act: any) => ({
          id: act.id || Math.random().toString(),
          type: act.activityType || "Hoạt động",
          description: act.description || "",
          user: act.adminName || "Hệ thống",
          date: act.createdAt ? new Date(act.createdAt).toLocaleString("vi-VN") : "Vừa xong",
          status: "Hoàn tất",
          statusColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
        }));
        setActivities(mappedActivities);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        triggerToast("Không thể tải dữ liệu tổng quan");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [triggerToast]);

  const statusData = [
    { name: "Đang thuê", value: overview?.activeRentals || 0, color: "#3b82f6" },
    { name: "Khác", value: Math.max(0, (overview?.totalRentals || 0) - (overview?.activeRentals || 0)), color: "#10b981" },
  ];

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6 w-full">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-semibold text-primary">Tổng quan hệ thống</h1>
            <p className="text-sm text-secondary mt-1">Theo dõi các chỉ số quan trọng của RentHub</p>
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
                  title="Tổng Doanh Thu"
                  value={`${overview?.totalRevenue?.toLocaleString('vi-VN') || 0} ₫`}
                  icon={<DollarSign className="w-5 h-5" />}
                />
                <AnalyticsCard
                  title="Tổng Đơn Thuê"
                  value={overview?.totalRentals || 0}
                  icon={<ClipboardList className="w-5 h-5" />}
                />
                <AnalyticsCard
                  title="Sản Phẩm"
                  value={overview?.totalProducts || 0}
                  icon={<Package className="w-5 h-5" />}
                />
                <AnalyticsCard
                  title="Người Dùng"
                  value={overview?.totalUsers || 0}
                  icon={<Users className="w-5 h-5" />}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-primary border border-secondary rounded-xl p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-primary mb-5">Biểu đồ doanh thu</h3>
                  <RevenueChart data={revenueData} />
                </div>
                <div className="bg-primary border border-secondary rounded-xl p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-primary mb-5">Trạng thái đơn thuê</h3>
                  <StatusPieChart data={statusData} />
                </div>
              </div>

              {/* Recent Activity */}
              <RecentActivityTable title="Hoạt động quản trị gần đây" data={activities} />
            </>
          )}
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}
