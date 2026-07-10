"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import api from "@/lib/axios";
import { useToast } from "@/context/ToastContext";
import { Pencil, Trash2, Loader2, Plus, X } from "lucide-react";

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
        await api.put(`/categories/${editingId}`, { name, slug, description });
        triggerToast("Cập nhật danh mục thành công!");
      } else {
        await api.post("/categories", { name, slug, description });
        triggerToast("Tạo danh mục mới thành công!");
      }
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
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main content - Table of categories */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-primary">Quản lý danh mục</h1>
              <p className="text-sm text-secondary mt-1">Danh sách phân loại sản phẩm cho thuê trên hệ thống</p>
            </div>

            {loading ? (
              <div className="py-24 bg-primary border border-secondary rounded-xl flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
                <p className="text-sm text-secondary">Đang tải danh mục...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-24 bg-primary border border-secondary rounded-xl flex flex-col items-center justify-center text-center">
                <p className="text-sm text-secondary">Không tìm thấy danh mục nào.</p>
              </div>
            ) : (
              <div className="bg-primary border border-secondary rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-secondary border-b border-secondary">
                        <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Tên danh mục</th>
                        <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Slug đường dẫn</th>
                        <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Mô tả</th>
                        <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary">
                      {categories.map((item) => (
                        <tr key={item.id} className="hover:bg-tertiary transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-primary">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-secondary font-mono">{item.slug}</td>
                          <td className="px-4 py-3 text-sm text-secondary truncate max-w-[200px]">
                            {item.description || "Chưa có"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 rounded-lg transition-colors cursor-pointer"
                                title="Sửa danh mục"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors cursor-pointer"
                                title="Xóa danh mục"
                              >
                                <Trash2 className="w-4 h-4" />
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
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-primary">
                {editingId ? "Cập nhật danh mục" : "Tạo danh mục mới"}
              </h2>
              <p className="text-sm text-secondary mt-1">
                {editingId ? "Chỉnh sửa các thuộc tính của danh mục chọn" : "Bổ sung danh mục thuê mới vào kho dữ liệu"}
              </p>
            </div>

            <div className="bg-primary p-5 rounded-xl border border-secondary shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Category Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-secondary">
                    Tên danh mục <span className="text-red-500">*</span>
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
                    className="w-full px-3 py-2 rounded-lg border border-secondary bg-primary text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-secondary">
                    Slug đường dẫn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Ví dụ: do-gia-dung"
                    className="w-full px-3 py-2 rounded-lg border border-secondary bg-primary text-sm font-mono text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-secondary">Mô tả</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Các mặt hàng đồ gia dụng dùng trong nhà..."
                    className="w-full px-3 py-2 rounded-lg border border-secondary bg-primary text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all min-h-[80px] resize-y"
                  />
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex justify-end gap-2">
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary hover:bg-tertiary text-primary rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      Hủy
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingId ? (
                      <Pencil className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
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
