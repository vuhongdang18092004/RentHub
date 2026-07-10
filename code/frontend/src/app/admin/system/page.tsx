"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import api from "@/lib/axios";
import { useToast } from "@/context/ToastContext";
import { ExportButton } from "@/components/admin/ExportButton";
import { Loader2, Server, Database, Bot, Bell, HardDrive, Clock, Activity, Settings as SettingsIcon, Save } from "lucide-react";

interface SystemSettings {
  commissionRate: number;
  maxRentalDays: number;
  defaultDepositPercent: number;
  maintenanceMode: boolean;
  aiEnabled: boolean;
  notificationEnabled: boolean;
  reviewModerationEnabled: boolean;
}

export default function AdminSystemPage() {
  const { triggerToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [settings, setSettings] = useState<SystemSettings>({
    commissionRate: 0.05,
    maxRentalDays: 30,
    defaultDepositPercent: 0.5,
    maintenanceMode: false,
    aiEnabled: true,
    notificationEnabled: true,
    reviewModerationEnabled: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const healthRes = await api.get("/admin/system/health");
      setHealthData(healthRes.data);

      const settingsRes = await api.get("/admin/system/settings");
      if (settingsRes.data) {
        setSettings(settingsRes.data);
      }
    } catch (error) {
      console.error("System fetch error:", error);
      triggerToast("Không thể tải thông tin hệ thống");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [triggerToast]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put("/admin/system/settings", settings);
      triggerToast("Cập nhật cấu hình hệ thống thành công!");
      fetchData();
    } catch (error) {
      console.error("Save settings error:", error);
      triggerToast("Lưu cấu hình thất bại!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-primary">Hệ thống & Cài đặt</h1>
              <p className="text-sm text-secondary mt-1">Quản lý cấu hình và trạng thái máy chủ</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ExportButton endpoint="/admin/users/export" filename="users.csv" label="Xuất DS Users" />
              <ExportButton endpoint="/admin/export/audit-logs" filename="audit-logs.csv" label="Xuất Audit Log" />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-24 bg-primary border border-secondary rounded-xl shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                <span className="text-sm font-medium text-secondary">Đang tải dữ liệu hệ thống...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* System Health Status */}
              <div className="lg:col-span-1 bg-primary border border-secondary rounded-xl p-6 shadow-sm flex flex-col gap-6">
                <div className="flex items-center gap-2 border-b border-secondary pb-4">
                  <Activity className="w-5 h-5 text-brand-600" />
                  <h3 className="text-lg font-semibold text-primary">Trạng thái máy chủ</h3>
                </div>
                
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-2 text-secondary">
                      <Server className="w-4 h-4" />
                      <span className="text-sm font-medium">Trạng thái chung</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${healthData?.status === 'UP' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'}`}>
                      {healthData?.status || "UNKNOWN"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-secondary rounded-lg">
                    <div className="flex items-center gap-2 text-secondary">
                      <Database className="w-4 h-4" />
                      <span className="text-sm font-medium">Database</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">{healthData?.databaseStatus || "CONNECTED"}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-secondary rounded-lg">
                    <div className="flex items-center gap-2 text-secondary">
                      <Bot className="w-4 h-4" />
                      <span className="text-sm font-medium">AI Service</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">{healthData?.aiProviderStatus || "ACTIVE"}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-secondary rounded-lg">
                    <div className="flex items-center gap-2 text-secondary">
                      <Bell className="w-4 h-4" />
                      <span className="text-sm font-medium">Notification</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">{healthData?.notificationServiceStatus || "ACTIVE"}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-secondary rounded-lg">
                    <div className="flex items-center gap-2 text-secondary">
                      <HardDrive className="w-4 h-4" />
                      <span className="text-sm font-medium">Storage</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">{healthData?.storageStatus || "ACTIVE"}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-secondary rounded-lg">
                    <div className="flex items-center gap-2 text-secondary">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Uptime</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">{healthData?.applicationUptime || "99.9%"}</span>
                  </div>
                </div>
              </div>

              {/* System Settings Form */}
              <div className="lg:col-span-2 bg-primary border border-secondary rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-secondary pb-4 mb-6">
                  <SettingsIcon className="w-5 h-5 text-brand-600" />
                  <h3 className="text-lg font-semibold text-primary">Cấu hình hệ thống</h3>
                </div>
                
                <form onSubmit={handleSaveSettings} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-secondary">Tỷ lệ phí hoa hồng (%)</label>
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={settings.commissionRate}
                        onChange={(e) => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-secondary bg-primary rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-secondary">Số ngày thuê tối đa</label>
                      <input 
                        type="number"
                        min="1"
                        value={settings.maxRentalDays}
                        onChange={(e) => setSettings({ ...settings, maxRentalDays: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-secondary bg-primary rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-secondary">Phần trăm đặt cọc mặc định</label>
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={settings.defaultDepositPercent}
                        onChange={(e) => setSettings({ ...settings, defaultDepositPercent: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-secondary bg-primary rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="border-t border-secondary pt-6 space-y-5">
                    <h4 className="text-sm font-semibold text-primary mb-2">Tính năng hệ thống</h4>
                    
                    <div className="flex items-center justify-between p-4 border border-secondary rounded-lg hover:bg-tertiary transition-colors">
                      <div className="pr-4">
                        <p className="text-sm font-semibold text-primary">Chế độ bảo trì</p>
                        <p className="text-xs text-secondary mt-0.5">Tạm dừng toàn bộ các giao dịch trên trang web, chỉ Admin có thể truy cập</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input 
                          type="checkbox"
                          checked={settings.maintenanceMode}
                          onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-secondary rounded-lg hover:bg-tertiary transition-colors">
                      <div className="pr-4">
                        <p className="text-sm font-semibold text-primary">Tích hợp AI Gemini</p>
                        <p className="text-xs text-secondary mt-0.5">Kích hoạt Chatbot AI hỗ trợ tự động và gợi ý sản phẩm</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input 
                          type="checkbox"
                          checked={settings.aiEnabled}
                          onChange={(e) => setSettings({ ...settings, aiEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-secondary rounded-lg hover:bg-tertiary transition-colors">
                      <div className="pr-4">
                        <p className="text-sm font-semibold text-primary">Bộ lọc kiểm duyệt Review</p>
                        <p className="text-xs text-secondary mt-0.5">Yêu cầu kiểm duyệt nội dung đánh giá của thành viên trước khi hiển thị</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input 
                          type="checkbox"
                          checked={settings.reviewModerationEnabled}
                          onChange={(e) => setSettings({ ...settings, reviewModerationEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Lưu cấu hình
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}
