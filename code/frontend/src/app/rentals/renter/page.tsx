"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { rentalService, RentalRequestSummaryResponse, RequestStatus } from "@/services/rental-service";
import { useToast } from "@/context/ToastContext";
import { Loader2, Package, Inbox } from "lucide-react";

export default function RenterRentalsPage() {
  const { triggerToast } = useToast();
  const router = useRouter();
  const [requests, setRequests] = useState<RentalRequestSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const filter = statusFilter === "ALL" ? undefined : statusFilter;
      const res = await rentalService.getMyRentalRequests(filter, page, 8);
      setRequests(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      console.error("Lỗi lấy danh sách đơn thuê:", err);
      triggerToast("Không thể tải danh sách đơn thuê của bạn!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, page]);

  const handleCancelRequest = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu đặt thuê này?")) return;
    try {
      await rentalService.cancelRentalRequest(id);
      triggerToast("Đã hủy yêu cầu đặt thuê thành công!");
      fetchRequests();
    } catch (err: any) {
      console.error("Lỗi hủy yêu cầu:", err);
      triggerToast(err.response?.data?.message || "Hủy yêu cầu thất bại!");
    }
  };

  const getStatusBadge = (status: RequestStatus, rentalStatus?: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900 rounded-full">
            Chờ duyệt
          </span>
        );
      case "APPROVED":
        if (rentalStatus === "ACTIVE") {
          return (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400 border border-brand-200 dark:border-brand-900 rounded-full">
              Đang thuê
            </span>
          );
        }
        if (rentalStatus === "RETURN_PENDING") {
          return (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded-full animate-pulse">
              Đang trả đồ
            </span>
          );
        }
        if (rentalStatus === "COMPLETED") {
          return (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-full">
              Hoàn thành
            </span>
          );
        }
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full">
            Chờ thanh toán
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-full">
            Bị từ chối
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-secondary text-secondary border border-secondary rounded-full">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-primary">Đơn thuê của tôi</h1>
            <p className="text-sm text-secondary mt-1">Theo dõi trạng thái các mặt hàng bạn đã yêu cầu thuê</p>
          </div>

          {/* Filter Bar */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {([
              { label: "Tất cả", value: "ALL" },
              { label: "Chờ duyệt", value: "PENDING" },
              { label: "Đã duyệt", value: "APPROVED" },
              { label: "Bị từ chối", value: "REJECTED" },
              { label: "Đã hủy", value: "CANCELLED" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setStatusFilter(opt.value);
                  setPage(0);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  statusFilter === opt.value
                    ? "bg-brand-600 text-white"
                    : "bg-secondary text-primary hover:bg-tertiary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Requests Content */}
          {loading ? (
            <div className="py-20 bg-primary border border-secondary rounded-xl flex flex-col items-center justify-center gap-4 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
              <p className="text-sm text-secondary">Đang tải danh sách đơn thuê...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 bg-primary border border-secondary rounded-xl flex flex-col items-center justify-center gap-4 text-center px-6 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-primary">Chưa có đơn thuê nào</h3>
                <p className="text-sm text-secondary">Bạn chưa gửi yêu cầu thuê bất kỳ sản phẩm nào.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-primary border border-secondary rounded-xl p-5 shadow-sm hover:border-brand-300 transition-colors flex flex-col justify-between gap-4"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary shrink-0 border border-secondary flex items-center justify-center">
                        {req.productImage ? (
                          <img src={req.productImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-8 h-8 text-tertiary" />
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-semibold text-sm text-primary truncate">
                            {req.productName}
                          </h3>
                          <div className="shrink-0">{getStatusBadge(req.status, req.rentalStatus)}</div>
                        </div>
                        <div className="text-xs text-secondary">
                          Chủ đồ: <span className="text-primary font-medium">{req.owner?.fullName}</span>
                        </div>
                        <div className="text-xs text-secondary flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded w-fit">
                          <span>{new Date(req.startDate).toLocaleDateString("vi-VN")}</span>
                          <span>→</span>
                          <span>{new Date(req.endDate).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Action Footer */}
                    <div className="flex justify-between items-center border-t border-secondary pt-4 mt-auto">
                      <div>
                        <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Tổng chi phí</span>
                        <p className="text-sm font-bold text-brand-600">
                          {Number(req.requestedPrice).toLocaleString("vi-VN")}đ
                        </p>
                      </div>

                      {req.status === "PENDING" && (
                        <button
                          onClick={() => handleCancelRequest(req.id)}
                          className="px-4 py-2 border border-secondary hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-secondary rounded-lg text-sm font-medium transition-colors"
                        >
                          Hủy yêu cầu
                        </button>
                      )}

                      {req.status === "APPROVED" && req.rentalId && (
                        <button
                          onClick={() => router.push(`/rentals/${req.rentalId}`)}
                          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Chi tiết
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border border-secondary rounded-lg text-sm font-medium text-secondary hover:bg-secondary disabled:opacity-50 transition-colors"
                  >
                    Trước
                  </button>
                  <span className="text-sm text-secondary font-medium px-2">
                    Trang {page + 1} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages - 1}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border border-secondary rounded-lg text-sm font-medium text-secondary hover:bg-secondary disabled:opacity-50 transition-colors"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
