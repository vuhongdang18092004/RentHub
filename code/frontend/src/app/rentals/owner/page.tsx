"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { rentalService, RentalRequestSummaryResponse, RentalRequestStatisticsResponse, RequestStatus } from "@/services/rental-service";
import { useToast } from "@/context/ToastContext";

export default function OwnerRentalsPage() {
  const router = useRouter();
  const { triggerToast } = useToast();
  const [requests, setRequests] = useState<RentalRequestSummaryResponse[]>([]);
  const [stats, setStats] = useState<RentalRequestStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">("ALL");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const data = await rentalService.getOwnerRentalRequestStatistics();
      setStats(data);
    } catch (err) {
      console.error("Lỗi lấy thống kê:", err);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const filter = statusFilter === "ALL" ? undefined : statusFilter;
      const res = await rentalService.getOwnerRentalRequests({
        status: filter,
        sort,
        page,
        size: 8,
      });
      setRequests(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      console.error("Lỗi lấy danh sách yêu cầu thuê:", err);
      triggerToast("Không thể tải danh sách yêu cầu thuê gửi đến!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, sort, page]);

  const handleApprove = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn DUYỆT yêu cầu thuê này?")) return;
    try {
      await rentalService.approveRentalRequest(id);
      triggerToast("Đã duyệt yêu cầu đặt thuê thành công! ✅");
      fetchStats();
      fetchRequests();
    } catch (err: any) {
      console.error("Lỗi duyệt yêu cầu:", err);
      const msg = err.response?.data?.message || "Duyệt yêu cầu thất bại!";
      setErrorModal(msg);
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn TỪ CHỐI yêu cầu thuê này?")) return;
    try {
      await rentalService.rejectRentalRequest(id);
      triggerToast("Đã từ chối yêu cầu đặt thuê! ❌");
      fetchStats();
      fetchRequests();
    } catch (err: any) {
      console.error("Lỗi từ chối yêu cầu:", err);
      const msg = err.response?.data?.message || "Từ chối yêu cầu thất bại!";
      setErrorModal(msg);
    }
  };

  const handleConfirmReturn = async (id?: number) => {
    if (!id) {
      triggerToast("Không tìm thấy mã đơn thuê! Vui lòng tải lại trang (F5). 🔄");
      return;
    }
    if (!window.confirm("Bạn xác nhận đã nhận lại sản phẩm an toàn và hoàn tất giao dịch thuê này?")) return;
    try {
      await rentalService.confirmReturn(id);
      triggerToast("Đã xác nhận nhận đồ và hoàn tất giao dịch! 🎉");
      fetchStats();
      fetchRequests();
    } catch (err: any) {
      console.error("Lỗi xác nhận nhận đồ:", err);
      const msg = err.response?.data?.message || "Xác nhận nhận đồ thất bại!";
      setErrorModal(msg);
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
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-250 rounded-full">
            Đã duyệt
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

          {/* Error Modal Popup */}
          {errorModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center gap-5 animate-[fadeInScale_0.2s_ease-out]">
                {/* Icon */}
                <div className="w-16 h-16 bg-red-50 border-2 border-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                {/* Title */}
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-black text-zinc-800">Không thể thực hiện thao tác</h3>
                  <p className="text-sm text-zinc-500 font-semibold leading-relaxed">{errorModal}</p>
                </div>
                {/* Close Button */}
                <button
                  onClick={() => setErrorModal(null)}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-black rounded-2xl transition-all active:scale-[0.98]"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          )}
          
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-primary">Yêu cầu thuê gửi đến</h1>
            <p className="text-sm text-secondary">Phê duyệt hoặc từ chối các yêu cầu thuê đồ dùng của bạn</p>
          </div>

          {/* Stats Cards Section */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-zinc-150 rounded-2xl p-4 shadow-sm select-none">
                <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide">TẤT CẢ YÊU CẦU</span>
                <p className="text-2xl font-black text-zinc-800 mt-1">{stats.total}</p>
              </div>
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 shadow-sm select-none">
                <span className="text-[10px] text-amber-600/80 font-extrabold uppercase tracking-wide">ĐANG CHỜ DUYỆT</span>
                <p className="text-2xl font-black text-amber-700 mt-1">{stats.pending}</p>
              </div>
              <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 shadow-sm select-none">
                <span className="text-[10px] text-green-600/80 font-extrabold uppercase tracking-wide">ĐÃ PHÊ DUYỆT</span>
                <p className="text-2xl font-black text-green-700 mt-1">{stats.approved}</p>
              </div>
              <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 shadow-sm select-none">
                <span className="text-[10px] text-red-600/80 font-extrabold uppercase tracking-wide">BỊ TỪ CHỐI</span>
                <p className="text-2xl font-black text-red-700 mt-1">{stats.rejected}</p>
              </div>
            </div>
          )}

          {/* Filter & Sort Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
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

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-zinc-450">Sắp xếp:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-extrabold text-zinc-700 focus:outline-none cursor-pointer focus:border-violet-500"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>

          {/* Content Listing */}
          {loading ? (
            <div className="py-24 bg-primary border border-secondary rounded-[24px] flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-secondary font-medium">Đang tải danh sách yêu cầu...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-24 bg-primary border border-secondary rounded-[24px] flex flex-col items-center justify-center gap-4 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-primary">Chưa nhận được yêu cầu nào</h3>
                <p className="text-xs text-secondary">Hiện tại chưa có thành viên nào gửi yêu cầu thuê sản phẩm của bạn.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Grid of Owner Requests */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white border border-zinc-150 rounded-2xl p-4 shadow-sm hover:shadow transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-150">
                          {req.productImage ? (
                            <img src={req.productImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center text-2xl bg-zinc-100">📦</span>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-extrabold text-sm text-zinc-800 truncate leading-snug">
                              {req.productName}
                            </h3>
                            {getStatusBadge(req.status, req.rentalStatus)}
                          </div>
                          
                          {/* Renter Details Info */}
                          <div className="flex items-center gap-2 pt-0.5">
                            <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-[9px] font-black shrink-0 border border-violet-250">
                              {req.renter.fullName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[10px] text-zinc-500 font-bold">
                              Người thuê: <span className="text-zinc-700 font-black">{req.renter.fullName}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-550 pt-1">
                            <span>Từ {new Date(req.startDate).toLocaleDateString("vi-VN")}</span>
                            <span>→</span>
                            <span>Đến {new Date(req.endDate).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center border-t border-zinc-100 pt-3">
                      <div>
                        <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wide">DOANH THU THUÊ</span>
                        <p className="text-sm font-black text-violet-700">
                          {Number(req.requestedPrice).toLocaleString("vi-VN")}đ
                        </p>
                      </div>

                      {req.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs hover:shadow active:scale-[0.99]"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs hover:shadow active:scale-[0.99]"
                          >
                            Duyệt đơn
                          </button>
                        </div>
                      ) : req.status === "APPROVED" && req.rentalId ? (
                        <div className="flex gap-2">
                          {req.rentalStatus === "RETURN_PENDING" && (
                            <button
                              onClick={() => handleConfirmReturn(req.rentalId!)}
                              className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs hover:shadow active:scale-[0.99] animate-[pulse_2s_infinite]"
                            >
                              Xác nhận nhận đồ
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/rentals/${req.rentalId}`)}
                            className="px-3.5 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow hover:scale-[1.01] transition-all cursor-pointer"
                          >
                            Chi tiết thuê đồ
                          </button>
                        </div>
                      ) : (
                        <div className="text-[10px] text-zinc-400 font-bold select-none italic">
                          Hết hiệu lực xử lý
                        </div>
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
