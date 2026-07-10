"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { reportService } from "@/services/report-service";
import { ReportDetailAdminResponse, ReportStatus, ResolutionAction } from "@/types/backend";
import { useToast } from "@/context/ToastContext";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from "@untitledui/icons";

export default function AdminReportDetailPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const { triggerToast } = useToast();
  
  const [report, setReport] = useState<ReportDetailAdminResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Resolution Form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionForm, setActionForm] = useState({
    status: "UNDER_REVIEW" as ReportStatus,
    resolutionAction: "NO_ACTION" as ResolutionAction,
    refundAmount: "",
    adminNote: ""
  });

  const fetchReportDetail = async () => {
    try {
      setLoading(true);
      const data = await reportService.getReportDetailAdmin(Number(params.id));
      setReport(data);
      setActionForm(prev => ({
        ...prev,
        status: data.status === "PENDING" ? "UNDER_REVIEW" : data.status,
      }));
    } catch (error) {
      console.error("Lỗi lấy chi tiết khiếu nại:", error);
      triggerToast("Không thể tải chi tiết khiếu nại!");
      router.push("/admin/reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchReportDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;
    
    try {
      setIsSubmitting(true);
      await reportService.updateReportStatusAdmin(report.id, {
        status: actionForm.status,
        resolutionAction: actionForm.resolutionAction,
        adminNote: actionForm.adminNote,
        refundAmount: actionForm.refundAmount ? Number(actionForm.refundAmount) : undefined
      });
      triggerToast("Cập nhật trạng thái thành công!");
      fetchReportDetail(); // Reload
    } catch (error: any) {
      console.error("Lỗi cập nhật:", error);
      triggerToast(error.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </DashboardLayout>
      </AdminRoute>
    );
  }

  if (!report) return null;

  const isResolvedOrRejected = report.status === "RESOLVED" || report.status === "REJECTED";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">CHỜ XỬ LÝ</span>;
      case "UNDER_REVIEW": return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">ĐANG XEM XÉT</span>;
      case "RESOLVED": return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">ĐÃ GIẢI QUYẾT</span>;
      case "REJECTED": return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">BỊ TỪ CHỐI</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const RENTAL_STAGES = [
    "WAITING_PAYMENT", "HANDOVER_PENDING", "ACTIVE", "RETURN_PENDING", "COMPLETED", "CANCELLED"
  ];
  
  const currentStageIndex = RENTAL_STAGES.indexOf(report.rental.status);

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="space-y-6 pb-20">
          
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/admin/reports")} className="p-2 hover:bg-secondary rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-secondary" />
            </button>
            <h1 className="text-2xl font-bold text-primary">Chi tiết khiếu nại #{report.id}</h1>
            {getStatusBadge(report.status)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột 1: Thông tin Report & Form Giải quyết */}
            <div className="lg:col-span-1 space-y-6">
              
              <div className="bg-primary border border-secondary rounded-2xl p-5 space-y-4">
                <h3 className="text-lg font-bold text-primary">Nội dung khiếu nại</h3>
                <div>
                  <p className="text-xs text-secondary font-semibold uppercase">Lý do</p>
                  <p className="text-sm text-primary font-medium mt-1">{report.reason}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary font-semibold uppercase">Mô tả chi tiết</p>
                  <p className="text-sm text-primary mt-1 p-3 bg-secondary rounded-xl whitespace-pre-wrap">{report.description}</p>
                </div>
                {report.evidenceImageUrl && (
                  <div>
                    <p className="text-xs text-secondary font-semibold uppercase mb-2">Hình ảnh bằng chứng</p>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-secondary">
                      <Image src={report.evidenceImageUrl} alt="Evidence" fill className="object-cover" />
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-secondary font-semibold uppercase">Ngày tạo</p>
                  <p className="text-sm text-primary mt-1">{new Date(report.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              </div>

              {/* Form Giải quyết */}
              <div className="bg-primary border border-brand-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <h3 className="text-lg font-bold text-brand-700">Quyết định của Admin</h3>
                
                {isResolvedOrRejected ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-sm text-primary font-medium">Khiếu nại này đã được đóng.</p>
                      {report.resolvedAt && <p className="text-xs text-secondary mt-1">Lúc: {new Date(report.resolvedAt).toLocaleString("vi-VN")}</p>}
                    </div>
                    {report.adminNote && (
                      <div>
                        <p className="text-xs text-secondary font-semibold uppercase">Ghi chú của Admin</p>
                        {(() => {
                          const regex = /\[RESOLVED_ACTION=([^,]+)(?:,\s*REFUND_AMOUNT=([^\]]+))?\]\s*(.*)/;
                          const match = report.adminNote.match(regex);
                          if (match) {
                            const action = match[1];
                            const amount = match[2];
                            const message = match[3];
                            return (
                              <div className="space-y-2 mt-2">
                                <div className="text-xs font-semibold text-brand-700 bg-brand-50 p-2 rounded-lg inline-block w-fit border border-brand-200">
                                  Hành động xử lý: <span className="font-bold">{action}</span>
                                  {amount && amount !== "0" && ` - Hoàn/Đền bù: ${parseInt(amount, 10).toLocaleString()} VND`}
                                </div>
                                {message && (
                                  <p className="text-sm text-primary mt-1 p-3 bg-secondary rounded-xl border border-zinc-200">{message}</p>
                                )}
                              </div>
                            );
                          }
                          return (
                            <p className="text-sm text-primary mt-1 p-3 bg-secondary rounded-xl">{report.adminNote}</p>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleResolve} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-secondary uppercase">Hành động xử lý</label>
                      <select 
                        required
                        className="w-full p-2.5 bg-secondary border border-secondary rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
                        value={actionForm.status}
                        onChange={e => setActionForm(p => ({ ...p, status: e.target.value as ReportStatus }))}
                      >
                        <option value="UNDER_REVIEW">Tiếp tục xem xét (Giữ trạng thái Pending/Review)</option>
                        <option value="RESOLVED">Chấp nhận khiếu nại (Đã giải quyết)</option>
                        <option value="REJECTED">Từ chối khiếu nại (Không hợp lệ)</option>
                      </select>
                    </div>

                    {(actionForm.status === "RESOLVED") && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs font-semibold text-secondary uppercase">Hình thức bồi thường / Phạt</label>
                        <select 
                          className="w-full p-2.5 bg-secondary border border-secondary rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
                          value={actionForm.resolutionAction}
                          onChange={e => setActionForm(p => ({ ...p, resolutionAction: e.target.value as ResolutionAction }))}
                        >
                          <option value="NO_ACTION">Không có hành động</option>
                          <option value="COMPLETE_RENTAL">Hoàn thành đơn thuê (Thanh toán cho chủ)</option>
                          <option value="CANCEL_RENTAL">Hủy đơn thuê (Không hoàn tiền)</option>
                          <option value="REFUND_FULL">Hoàn tiền 100% cho người thuê</option>
                          <option value="REFUND_PARTIAL">Hoàn tiền một phần</option>
                        </select>
                      </div>
                    )}

                    {(actionForm.resolutionAction === "REFUND_FULL" || actionForm.resolutionAction === "REFUND_PARTIAL") && actionForm.status === "RESOLVED" && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs font-semibold text-secondary uppercase">Số tiền hoàn/đền bù (VND)</label>
                        <input 
                          type="number"
                          required
                          placeholder="Ví dụ: 50000"
                          className="w-full p-2.5 bg-secondary border border-secondary rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
                          value={actionForm.refundAmount}
                          onChange={e => setActionForm(p => ({ ...p, refundAmount: e.target.value }))}
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-secondary uppercase">Ghi chú (Admin Note)</label>
                      <textarea 
                        rows={3}
                        required
                        placeholder="Nhập ghi chú lý do giải quyết để lưu lại..."
                        className="w-full p-2.5 bg-secondary border border-secondary rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
                        value={actionForm.adminNote}
                        onChange={e => setActionForm(p => ({ ...p, adminNote: e.target.value }))}
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Lưu Quyết Định
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Cột 2 & 3: Các thông tin liên quan */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product & Rental */}
                <div className="bg-primary border border-secondary rounded-2xl p-5 space-y-4">
                  <h3 className="text-lg font-bold text-primary">Thông tin Sản phẩm & Đơn</h3>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl relative overflow-hidden bg-secondary shrink-0">
                      <Image src={report.product.primaryImageUrl || "/placeholder-image.jpg"} alt="Product" fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary line-clamp-2">{report.product.name}</p>
                      <p className="text-xs text-secondary mt-1">Sản phẩm ID: #{report.product.id}</p>
                      <p className="text-xs text-secondary">Đơn thuê ID: #{report.rental.id}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-secondary">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-secondary">Thời gian thuê:</span>
                      <span className="font-semibold text-primary">{report.rental.rentalDays} ngày</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-secondary">Tổng tiền thuê:</span>
                      <span className="font-semibold text-primary">{report.rental.totalPrice?.toLocaleString()} đ</span>
                    </div>
                  </div>
                </div>

                {/* Users */}
                <div className="bg-primary border border-secondary rounded-2xl p-5 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-red-600 uppercase mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Người Tố Cáo
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                        {report.reporter.avatarUrl ? (
                          <Image src={report.reporter.avatarUrl} alt="Avatar" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">{report.reporter.fullName.charAt(0)}</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{report.reporter.fullName}</p>
                        <p className="text-xs text-secondary">{report.reporter.email}</p>
                        <p className="text-xs text-secondary">{report.reporter.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-secondary">
                    <h3 className="text-sm font-bold text-gray-600 uppercase mb-3">Người Bị Tố Cáo</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                        {report.reportedUser.avatarUrl ? (
                          <Image src={report.reportedUser.avatarUrl} alt="Avatar" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">{report.reportedUser.fullName.charAt(0)}</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{report.reportedUser.fullName}</p>
                        <p className="text-xs text-secondary">{report.reportedUser.email}</p>
                        <p className="text-xs text-secondary">{report.reportedUser.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lịch sử giao dịch */}
              <div className="bg-primary border border-secondary rounded-2xl p-5 space-y-4">
                <h3 className="text-lg font-bold text-primary">Lịch sử thanh toán đơn thuê</h3>
                {report.paymentHistory && report.paymentHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-secondary">
                          <th className="pb-2 pr-4 text-xs font-bold text-quaternary uppercase">Loại</th>
                          <th className="pb-2 pr-4 text-xs font-bold text-quaternary uppercase">Số tiền</th>
                          <th className="pb-2 pr-4 text-xs font-bold text-quaternary uppercase">PTTT</th>
                          <th className="pb-2 pr-4 text-xs font-bold text-quaternary uppercase">Mã GD</th>
                          <th className="pb-2 pr-4 text-xs font-bold text-quaternary uppercase">Trạng thái</th>
                          <th className="pb-2 pr-4 text-xs font-bold text-quaternary uppercase">Ngày</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-secondary">
                        {report.paymentHistory.map(payment => (
                          <tr key={payment.id}>
                            <td className="py-3 pr-4 text-sm font-medium">{payment.paymentType}</td>
                            <td className="py-3 pr-4 text-sm font-bold text-brand-600">{payment.amount.toLocaleString()} đ</td>
                            <td className="py-3 pr-4 text-sm text-secondary">{payment.paymentMethod}</td>
                            <td className="py-3 pr-4 text-sm text-secondary font-mono">{payment.transactionCode || "-"}</td>
                            <td className="py-3 pr-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${payment.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-sm text-secondary">{new Date(payment.paidAt).toLocaleString("vi-VN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-secondary italic">Chưa có giao dịch thanh toán nào được ghi nhận.</p>
                )}
              </div>

              {/* Rental Timeline */}
              <div className="bg-primary border border-secondary rounded-2xl p-5 space-y-4">
                <h3 className="text-lg font-bold text-primary">Tiến trình đơn thuê</h3>
                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -translate-y-1/2 rounded-full"></div>
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-brand-500 -translate-y-1/2 rounded-full transition-all duration-500"
                    style={{ width: `${(Math.max(0, currentStageIndex) / (RENTAL_STAGES.length - 1)) * 100}%` }}
                  ></div>
                  <div className="relative flex justify-between">
                    {RENTAL_STAGES.map((stage, idx) => {
                      const isPast = idx <= currentStageIndex;
                      const isCurrent = idx === currentStageIndex;
                      return (
                        <div key={stage} className="flex flex-col items-center gap-2 group">
                          <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                            isCurrent ? 'bg-brand-500 border-white ring-4 ring-brand-100' :
                            isPast ? 'bg-brand-500 border-brand-500' : 'bg-primary border-tertiary'
                          }`}></div>
                          <span className={`text-[10px] font-bold text-center w-20 ${
                            isCurrent ? 'text-brand-600' : isPast ? 'text-primary' : 'text-quaternary'
                          }`}>
                            {stage.replace("_", " ")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {report.rental.status === "CANCELLED" && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
                    Đơn thuê đã bị hủy. Lịch sử tiến trình dừng lại ở trạng thái này.
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}
