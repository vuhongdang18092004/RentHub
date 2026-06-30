"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import api from "@/lib/axios";
import { useToast } from "@/context/ToastContext";

interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export default function AdminCategoriesPage() {
  const { triggerToast } = useToast();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
      triggerToast("Không thể tải danh mục sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [triggerToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      triggerToast("Tên và Slug danh mục là bắt buộc!");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        // Edit Category
        await api.put(`/categories/${editingId}`, { name, slug, description });
        triggerToast("Cập nhật danh mục thành công!");
      } else {
        // Create Category
        await api.post("/categories", { name, slug, description });
        triggerToast("Tạo danh mục mới thành công!");
      }
      // Reset State
      setName("");
      setSlug("");
      setDescription("");
      setEditingId(null);
      fetchCategories();
    } catch (error: any) {
      console.error("Lỗi lưu danh mục:", error);
      const errMsg = error.response?.data?.message || "Lưu danh mục thất bại!";
      triggerToast(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: CategoryResponse) => {
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setDescription(item.description || "");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await api.delete(`/categories/${id}`);
      triggerToast("Xóa danh mục thành công!");
      fetchCategories();
    } catch (error: any) {
      console.error("Lỗi xóa danh mục:", error);
      const errMsg = error.response?.data?.message || "Xóa danh mục thất bại!";
      triggerToast(errMsg);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main content - Table of categories */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-primary">Quản lý danh mục</h1>
              <p className="text-sm text-secondary">Danh sách phân loại sản phẩm cho thuê trên hệ thống</p>
            </div>

            {loading ? (
              <div className="py-24 bg-primary border border-secondary rounded-[24px] flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-secondary font-medium">Đang tải danh mục...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-24 bg-primary border border-secondary rounded-[24px] flex flex-col items-center justify-center text-center">
                <p className="text-sm text-secondary font-medium">Không tìm thấy danh mục nào.</p>
              </div>
            ) : (
              <div className="bg-primary border border-secondary rounded-[24px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-secondary border-b border-secondary">
                        <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider">Tên danh mục</th>
                        <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider">Slug đường dẫn</th>
                        <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider">Mô tả</th>
                        <th className="px-6 py-4 text-xs font-bold text-quaternary uppercase tracking-wider text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary">
                      {categories.map((item) => (
                        <tr key={item.id} className="hover:bg-secondary transition-colors">
                          <td className="px-6 py-4 font-semibold text-sm text-primary">{item.name}</td>
                          <td className="px-6 py-4 text-sm text-secondary font-mono">{item.slug}</td>
                          <td className="px-6 py-4 text-sm text-secondary truncate max-w-[200px]">
                            {item.description || "Chưa có"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                                title="Sửa danh mục"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-error-primary hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Xóa danh mục"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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

          {/* Form sidebar to create/edit category */}
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-primary">
                {editingId ? "Cập nhật danh mục" : "Tạo danh mục mới"}
              </h2>
              <p className="text-xs text-secondary">
                {editingId ? "Chỉnh sửa các thuộc tính của danh mục chọn" : "Bổ sung danh mục thuê mới vào kho dữ liệu"}
              </p>
            </div>

            <div className="bg-primary p-6 rounded-[24px] border border-secondary shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Category Name */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-xs font-semibold text-secondary">
                    Tên danh mục <span className="text-error-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingId) {
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/[đĐ]/g, "d")
                            .replace(/([^0-9a-z-\s])/g, "")
                            .replace(/(\s+)/g, "-")
                        );
                      }
                    }}
                    placeholder="Ví dụ: Đồ gia dụng"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-primary text-sm font-medium focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-xs font-semibold text-secondary">
                    Slug đường dẫn <span className="text-error-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Ví dụ: do-gia-dung"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-primary text-sm font-mono focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-xs font-semibold text-secondary">Mô tả</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Các mặt hàng đồ gia dụng dùng trong nhà..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-primary text-sm font-medium focus:outline-none focus:border-brand-500 transition-colors min-h-[80px]"
                  />
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex justify-end gap-2">
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-secondary hover:bg-tertiary text-primary rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Hủy
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo mới"}
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}
