"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import api from "@/lib/axios";
import { useToast } from "@/context/ToastContext";
import { ExportButton } from "@/components/admin/ExportButton";
import { Loader2 } from "lucide-react";

interface AuditLog {
  id: number;
  adminId: number;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const { triggerToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/audit-logs");
      const list = (res.data.content || []).map((log: any) => ({
        id: log.id,
        adminId: log.adminId,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: `${log.oldValue || ""} -> ${log.newValue || ""}`,
        ipAddress: "127.0.0.1",
        createdAt: log.createdAt || ""
      }));
      setLogs(list);
    } catch (error) {
      console.error("Audit Logs fetch error:", error);
      triggerToast("Không thể tải lịch sử hệ thống");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [triggerToast]);

  const getActionColor = (action: string) => {
    if (action.includes("APPROVE") || action.includes("RESOLVE") || action.includes("UNLOCK")) {
      return "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950";
    }
    if (action.includes("LOCK") || action.includes("REJECT") || action.includes("CANCEL")) {
      return "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950";
    }
    if (action.includes("UPDATE") || action.includes("EDIT")) {
      return "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950";
    }
    return "text-zinc-700 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800";
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-primary">Audit Logs</h1>
              <p className="text-sm text-secondary mt-1">Lịch sử thao tác của ban quản trị</p>
            </div>
            <ExportButton endpoint="/admin/export/audit-logs" filename="audit-logs.csv" label="Xuất CSV" />
          </div>

          <div className="bg-primary border border-secondary rounded-xl shadow-sm overflow-hidden">
            {/* Filter bar */}
            <div className="px-4 py-3 border-b border-secondary flex flex-wrap items-center gap-3">
              <input 
                type="text" 
                placeholder="Tìm kiếm hành động hoặc ID..." 
                className="px-3 py-2 border border-secondary rounded-lg text-sm bg-primary text-primary w-52 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              />
              <select className="px-3 py-2 border border-secondary rounded-lg text-sm bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Tất cả Entity</option>
                <option value="User">User</option>
                <option value="Product">Product</option>
                <option value="Report">Report</option>
                <option value="SystemSetting">SystemSetting</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary border-b border-secondary">
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Admin ID</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Hành Động</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Thực thể</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider w-1/3">Chi tiết</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">IP Address</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto" />
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center text-sm text-secondary">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-tertiary transition-colors">
                        <td className="px-4 py-3 text-sm font-mono font-medium text-primary">#{log.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-brand-600">Admin #{log.adminId}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="font-medium text-primary">{log.entityType}</span>{" "}
                          <span className="text-secondary">#{log.entityId}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-secondary">{log.details}</td>
                        <td className="px-4 py-3 text-sm font-mono text-tertiary">{log.ipAddress}</td>
                        <td className="px-4 py-3 text-sm text-secondary">
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
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
