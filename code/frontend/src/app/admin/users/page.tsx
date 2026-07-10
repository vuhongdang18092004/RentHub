"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import api from "@/lib/axios";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { Lock, Unlock, Loader2 } from "lucide-react";

interface AdminUserSummary {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: "PENDING" | "ACTIVE" | "BLOCKED";
  createdAt: string;
}

export default function AdminUsersPage() {
  const { triggerToast } = useToast();
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      // Res content is wrapped in spring data page
      setUsers(res.data.content || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách tài khoản:", error);
      triggerToast("Không thể tải danh sách tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [triggerToast]);

  const toggleUserStatus = async (id: number, currentStatus: string, email: string) => {
    if (email === currentAdmin?.email) {
      triggerToast("Bạn không thể tự khóa tài khoản của chính mình!");
      return;
    }

    const nextStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const confirmMsg = `Bạn có chắc chắn muốn chuyển trạng thái tài khoản này thành ${nextStatus === "ACTIVE" ? "HOẠT ĐỘNG" : "BỊ KHÓA"}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.put(`/admin/users/${id}/status`, { status: nextStatus });
      triggerToast("Cập nhật trạng thái tài khoản thành công!");
      fetchUsers();
    } catch (error: any) {
      console.error("Lỗi cập nhật trạng thái:", error);
      const errMsg = error.response?.data?.message || "Cập nhật trạng thái thất bại!";
      triggerToast(errMsg);
    }
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div>
            <h1 className="text-2xl font-semibold text-primary">Quản lý người dùng</h1>
            <p className="text-sm text-secondary mt-1">Theo dõi danh sách và khóa/kích hoạt tài khoản thành viên</p>
          </div>

          {loading ? (
            <div className="py-24 bg-primary border border-secondary rounded-xl flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
              <p className="text-sm text-secondary">Đang tải danh sách thành viên...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-24 bg-primary border border-secondary rounded-xl flex flex-col items-center justify-center text-center">
              <p className="text-sm text-secondary">Không tìm thấy thành viên nào.</p>
            </div>
          ) : (
            <div className="bg-primary border border-secondary rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary border-b border-secondary">
                      <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Họ và tên</th>
                      <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Số điện thoại</th>
                      <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Vai trò</th>
                      <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Trạng thái</th>
                      <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary">
                    {users.map((item) => (
                      <tr key={item.id} className="hover:bg-tertiary transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-primary">{item.fullName}</td>
                        <td className="px-4 py-3 text-sm text-secondary">{item.email}</td>
                        <td className="px-4 py-3 text-sm text-secondary">{item.phone || "Chưa cập nhật"}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.role === "ROLE_ADMIN"
                              ? "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                          }`}>
                            {item.role === "ROLE_ADMIN" ? "Admin" : "User"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                : item.status === "PENDING"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                            }`}
                          >
                            {item.status === "ACTIVE"
                              ? "Hoạt động"
                              : item.status === "PENDING"
                              ? "Chờ kích hoạt"
                              : "Đã khóa"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => toggleUserStatus(item.id, item.status, item.email)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                              item.status === "ACTIVE"
                                ? "bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-400"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-400"
                            }`}
                          >
                            {item.status === "ACTIVE" ? (
                              <><Lock className="w-3.5 h-3.5" /> Khóa</>
                            ) : (
                              <><Unlock className="w-3.5 h-3.5" /> Kích hoạt</>
                            )}
                          </button>
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
    </AdminRoute>
  );
}
