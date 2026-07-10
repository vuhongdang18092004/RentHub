"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import api from "@/lib/axios";
import { useToast } from "@/context/ToastContext";
import { Star, Eye, EyeOff, Loader2, AlertTriangle, RotateCcw, X } from "lucide-react";

interface Review {
  id: number;
  rentalId: number;
  reviewerId: number;
  targetUserId: number;
  rating: number;
  comment: string;
  isHidden: boolean;
  hiddenReason?: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const { triggerToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hideReason, setHideReason] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/reviews");
      setReviews(res.data.content || []);
    } catch (error) {
      console.error("Reviews fetch error:", error);
      triggerToast("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [triggerToast]);

  const handleHideReview = async () => {
    if (!hideReason) {
      triggerToast("Vui lòng nhập lý do ẩn");
      return;
    }
    
    try {
      await api.put(`/admin/reviews/${selectedReviewId}/hide`, { reason: hideReason });
      triggerToast("Đã ẩn đánh giá thành công!");
      fetchReviews();
      setSelectedReviewId(null);
      setHideReason("");
    } catch (error) {
      console.error("Hide review error:", error);
      triggerToast("Ẩn đánh giá thất bại");
    }
  };

  const handleRestoreReview = async (id: number) => {
    try {
      await api.put(`/admin/reviews/${id}/restore`);
      triggerToast("Đã khôi phục đánh giá thành công!");
      fetchReviews();
    } catch (error) {
      console.error("Restore review error:", error);
      triggerToast("Khôi phục đánh giá thất bại");
    }
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6 w-full">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Kiểm duyệt đánh giá</h1>
            <p className="text-sm text-secondary mt-1">Ẩn hoặc khôi phục các đánh giá vi phạm quy tắc cộng đồng</p>
          </div>

          <div className="bg-primary border border-secondary rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary border-b border-secondary">
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">ID Đơn</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Đánh giá</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Nội dung</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto" />
                      </td>
                    </tr>
                  ) : reviews.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center text-sm text-secondary">
                        Không có đánh giá nào
                      </td>
                    </tr>
                  ) : (
                    reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-tertiary transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-secondary">#{review.rentalId}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-300 dark:text-zinc-600'}`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-primary truncate max-w-md">{review.comment}</p>
                          {review.isHidden && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Lý do ẩn: {review.hiddenReason}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {review.isHidden ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 rounded-full text-xs font-medium">
                              <EyeOff className="w-3 h-3" />
                              Đã Ẩn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 rounded-full text-xs font-medium">
                              <Eye className="w-3 h-3" />
                              Công Khai
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {review.isHidden ? (
                            <button 
                              onClick={() => handleRestoreReview(review.id)}
                              className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 dark:text-brand-400 text-sm font-medium transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Khôi phục
                            </button>
                          ) : (
                            <button 
                              onClick={() => setSelectedReviewId(review.id)}
                              className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 dark:text-red-400 text-sm font-medium transition-colors cursor-pointer"
                            >
                              <EyeOff className="w-4 h-4" />
                              Ẩn đánh giá
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Hide Review Modal - theme-aware */}
        {selectedReviewId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-primary border border-secondary rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">Ẩn Đánh Giá</h3>
                <button onClick={() => setSelectedReviewId(null)} className="p-1 hover:bg-tertiary rounded-lg transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>
              <p className="text-sm text-secondary mb-4">
                Vui lòng cung cấp lý do bạn muốn ẩn đánh giá này. Đánh giá sẽ không bị xóa vĩnh viễn và có thể được khôi phục sau.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary mb-2">Lý do ẩn</label>
                <textarea
                  className="w-full px-3 py-2 border border-secondary rounded-lg bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-y"
                  rows={3}
                  placeholder="Ví dụ: Chứa từ ngữ thô tục..."
                  value={hideReason}
                  onChange={(e) => setHideReason(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedReviewId(null)}
                  className="px-4 py-2 bg-secondary text-primary rounded-lg text-sm font-medium hover:bg-tertiary transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleHideReview}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Xác nhận ẩn
                </button>
              </div>
            </div>
          </div>
        )}

      </DashboardLayout>
    </AdminRoute>
  );
}
