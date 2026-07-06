"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { rentalService, RentalRequestSummaryResponse, RequestStatus } from "@/services/rental-service";
import { useToast } from "@/context/ToastContext";

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
      triggerToast("Đã hủy yêu cầu đặt thuê thành công! ❌");
      fetchRequests();
    } catch (err: any) {
      console.error("Lỗi hủy yêu cầu:", err);
      triggerToast(err.response?.data?.message || "Hủy yêu cầu thất bại!");
    }
  };

  const handleRequestReturn = async (id?: number) => {
    if (!id) {
      triggerToast("Không tìm thấy mã đơn thuê! Vui lòng tải lại trang (F5). 🔄");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn đã sử dụng xong và muốn yêu cầu TRẢ ĐỒ cho sản phẩm này?")) return;
    try {
      await rentalService.requestReturn(id);
      triggerToast("Yêu cầu trả đồ thành công! Chờ chủ đồ xác nhận. 📤");
      fetchRequests();
    } catch (err: any) {
      console.error("Lỗi yêu cầu trả đồ:", err);
      triggerToast(err.response?.data?.message || "Yêu cầu trả đồ thất bại!");
    }
  };

  const getStatusBadge = (status: RequestStatus, rentalStatus?: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-250 rounded-full">
            Chờ duyệt
          </span>
        );
      case "APPROVED":
        if (rentalStatus === "ACTIVE") {
          return (
            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-violet-50 text-violet-750 border border-violet-250 rounded-full">
              Đang thuê
            </span>
          );
        }
        if (rentalStatus === "RETURN_PENDING") {
          return (
            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-750 border border-blue-250 rounded-full animate-pulse">
              Đang trả đồ
            </span>
          );
        }
        if (rentalStatus === "COMPLETED") {
          return (
            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-250 rounded-full">
              Hoàn thành
            </span>
          );
        }
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-yellow-50 text-yellow-750 border border-yellow-250 rounded-full">
            Chờ thanh toán
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-250 rounded-full">
            Bị từ chối
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-zinc-50 text-zinc-500 border border-zinc-250 rounded-full">
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
        <div className="space-y-6 font-sans">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-primary">Đơn thuê của tôi</h1>
            <p className="text-sm text-secondary">Theo dõi trạng thái các mặt hàng bạn đã yêu cầu thuê</p>
          </div>

          {/* Filter Bar */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide select-none">
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
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  statusFilter === opt.value
                    ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                    : "bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Requests Content */}
          {loading ? (
            <div className="py-24 bg-primary border border-secondary rounded-[24px] flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-secondary font-medium">Đang tải danh sách đơn thuê...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-24 bg-primary border border-secondary rounded-[24px] flex flex-col items-center justify-center gap-4 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-primary">Chưa có đơn thuê nào</h3>
                <p className="text-xs text-secondary">Bạn chưa gửi yêu cầu thuê bất kỳ sản phẩm nào.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Requests List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white border border-zinc-150 rounded-2xl p-4 shadow-sm hover:shadow transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-150">
                        {req.productImage ? (
                          <img src={req.productImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-2xl bg-zinc-100">📦</span>
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-extrabold text-sm text-zinc-800 truncate leading-snug">
                            {req.productName}
                          </h3>
                          {getStatusBadge(req.status, req.rentalStatus)}
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase">
                          CHỦ ĐỒ: <span className="text-zinc-650 font-black">{req.owner?.fullName}</span>
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-550 pt-1">
                          <span>Từ {new Date(req.startDate).toLocaleDateString("vi-VN")}</span>
                          <span>→</span>
                          <span>Đến {new Date(req.endDate).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Action Footer */}
                    <div className="flex justify-between items-center border-t border-zinc-100 pt-3">
                      <div>
                        <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wide">TỔNG CHI PHÍ</span>
                        <p className="text-sm font-black text-violet-700">
                          {Number(req.requestedPrice).toLocaleString("vi-VN")}đ
                        </p>
                      </div>

                      {req.status === "PENDING" && (
                        <button
                          onClick={() => handleCancelRequest(req.id)}
                          className="px-3.5 py-2 border border-zinc-200 hover:border-red-200 hover:bg-red-50 text-zinc-600 hover:text-red-600 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                        >
                          Hủy yêu cầu
                        </button>
                      )}

                      {req.status === "APPROVED" && req.rentalStatus === "WAITING_PAYMENT" && (
                        <button
                          onClick={() => router.push(`/checkout?requestId=${req.id}`)}
                          className="px-3.5 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow hover:scale-[1.01] transition-all cursor-pointer"
                        >
                          Thanh toán ngay
                        </button>
                      )}

                      {req.status === "APPROVED" && req.rentalStatus === "ACTIVE" && (
                        <button
                          onClick={() => handleRequestReturn(req.rentalId!)}
                          className="px-3.5 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow hover:scale-[1.01] transition-all cursor-pointer animate-[pulse_2s_infinite]"
                        >
                          Trả đồ
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-4">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Trước
                  </button>
                  <span className="text-xs text-zinc-500 font-extrabold px-3">
                    Trang {page + 1} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages - 1}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 transition-colors cursor-pointer"
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
