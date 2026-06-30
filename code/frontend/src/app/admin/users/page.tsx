"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import api from "@/lib/axios";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

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
        <div className="space-y-6">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-primary">Quản lý người dùng</h1>
            <p className="text-sm text-secondary">Theo dõi danh sách và khóa/kích hoạt tài khoản thành viên</p>
          </div>

          {loading ? (
            <div className="py-24 bg-primary border border-secondary rounded-[24px] flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-secondary font-medium">Đang tải danh sách thành viên...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-24 bg-primary border border-secondary rounded-[24px] flex flex-col items-center justify-center text-center">
              <p className="text-sm text-secondary font-medium">Không tìm thấy thành viên nào.</p>
            </div>
          ) : (
            <div className="bg-primary border border-secondary rounded-[24px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary border-b border-secondary">
                      <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider">Họ và tên</th>
                      <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider">Số điện thoại</th>
                      <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider">Vai trò</th>
                      <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary">
                    {users.map((item) => (
                      <tr key={item.id} className="hover:bg-secondary transition-colors">
                        <td className="px-6 py-4 font-semibold text-sm text-primary">{item.fullName}</td>
                        <td className="px-6 py-4 text-sm text-secondary">{item.email}</td>
                        <td className="px-6 py-4 text-sm text-secondary">{item.phone || "Chưa cập nhật"}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-secondary">
                          {item.role === "ROLE_ADMIN" ? "Admin" : "User"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                              item.status === "ACTIVE"
                                ? "bg-green-50 text-green-700"
                                : item.status === "PENDING"
                                ? "bg-orange-50 text-orange-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {item.status === "ACTIVE"
                              ? "Hoạt động"
                              : item.status === "PENDING"
                              ? "Chờ kích hoạt"
                              : "Đã khóa"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleUserStatus(item.id, item.status, item.email)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              item.status === "ACTIVE"
                                ? "bg-red-50 hover:bg-red-100 text-error-primary"
                                : "bg-green-50 hover:bg-green-100 text-green-700"
                            }`}
                          >
                            {item.status === "ACTIVE" ? "Khóa" : "Kích hoạt"}
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
