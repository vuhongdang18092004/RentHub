"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { rentalService, RentalRequestSummaryResponse, RentalRequestStatisticsResponse, RequestStatus } from "@/services/rental-service";
import { useToast } from "@/context/ToastContext";
import { Loader2, Package, Inbox, AlertTriangle, XCircle, CheckCircle } from "lucide-react";

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
      triggerToast("Đã duyệt yêu cầu đặt thuê thành công!");
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
      triggerToast("Đã từ chối yêu cầu đặt thuê!");
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
      triggerToast("Không tìm thấy mã đơn thuê! Vui lòng tải lại trang.");
      return;
    }
    if (!window.confirm("Bạn xác nhận đã nhận lại sản phẩm an toàn và hoàn tất giao dịch thuê này?")) return;
    try {
      await rentalService.confirmReturn(id);
      triggerToast("Đã xác nhận nhận đồ và hoàn tất giao dịch!");
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
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-full">
            Đã duyệt
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

          {/* Error Modal Popup */}
          {errorModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
              <div className="bg-primary rounded-2xl shadow-xl max-w-sm w-full p-6 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-semibold text-primary">Lỗi thao tác</h3>
                  <p className="text-sm text-secondary leading-relaxed">{errorModal}</p>
                </div>
                <button
                  onClick={() => setErrorModal(null)}
                  className="w-full py-2.5 mt-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
          
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-primary">Yêu cầu thuê gửi đến</h1>
            <p className="text-sm text-secondary mt-1">Phê duyệt hoặc từ chối các yêu cầu thuê đồ dùng của bạn</p>
          </div>

          {/* Stats Cards Section */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-primary border border-secondary rounded-xl p-5 shadow-sm flex flex-col justify-between h-[100px]">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Tất cả yêu cầu</span>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[100px]">
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-wider">Đang chờ duyệt</span>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.pending}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[100px]">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">Đã phê duyệt</span>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.approved}</p>
              </div>
              <div className="bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[100px]">
                <span className="text-xs font-semibold text-red-600 dark:text-red-500 uppercase tracking-wider">Bị từ chối</span>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.rejected}</p>
              </div>
            </div>
          )}

          {/* Filter & Sort Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-secondary">Sắp xếp:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-1.5 bg-primary border border-secondary rounded-lg text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>

          {/* Content Listing */}
          {loading ? (
            <div className="py-20 bg-primary border border-secondary rounded-xl flex flex-col items-center justify-center gap-4 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
              <p className="text-sm text-secondary">Đang tải danh sách yêu cầu...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 bg-primary border border-secondary rounded-xl flex flex-col items-center justify-center gap-4 text-center px-6 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-primary">Chưa nhận được yêu cầu nào</h3>
                <p className="text-sm text-secondary">Hiện tại chưa có thành viên nào gửi yêu cầu thuê sản phẩm của bạn.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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

                      {/* Product Info */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-semibold text-sm text-primary truncate">
                            {req.productName}
                          </h3>
                          <div className="shrink-0">{getStatusBadge(req.status, req.rentalStatus)}</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 text-[10px] font-bold shrink-0">
                            {req.renter.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-secondary">
                            Người thuê: <span className="text-primary font-medium">{req.renter.fullName}</span>
                          </span>
                        </div>

                        <div className="text-xs text-secondary flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded w-fit">
                          <span>{new Date(req.startDate).toLocaleDateString("vi-VN")}</span>
                          <span>→</span>
                          <span>{new Date(req.endDate).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center border-t border-secondary pt-4 mt-auto">
                      <div>
                        <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Doanh thu thuê</span>
                        <p className="text-sm font-bold text-brand-600">
                          {Number(req.requestedPrice).toLocaleString("vi-VN")}đ
                        </p>
                      </div>

                      {req.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                          >
                            Duyệt đơn
                          </button>
                        </div>
                      ) : req.status === "APPROVED" && req.rentalId ? (
                        <div className="flex gap-2">
                          {req.rentalStatus === "RETURN_PENDING" && (
                            <button
                              onClick={() => handleConfirmReturn(req.rentalId!)}
                              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors animate-[pulse_2s_infinite]"
                            >
                              Xác nhận nhận đồ
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/rentals/${req.rentalId}`)}
                            className="px-4 py-2 bg-secondary hover:bg-tertiary text-primary rounded-lg text-sm font-medium transition-colors"
                          >
                            Chi tiết
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-secondary font-medium">
                          Đã xử lý xong
                        </div>
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
