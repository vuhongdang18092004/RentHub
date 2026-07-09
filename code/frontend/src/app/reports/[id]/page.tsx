"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { reportService } from "@/services/report-service";
import { ReportResponse } from "@/types/backend";
import { useToast } from "@/context/ToastContext";

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = Number(params?.id || 0);
  const router = useRouter();
  const { triggerToast } = useToast();

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      try {
        setLoading(true);
        const data = await reportService.getReportDetail(reportId);
        setReport(data);
      } catch (err: any) {
        console.error(err);
        triggerToast("Không thể tải thông tin khiếu nại!");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-zinc-500 font-bold tracking-wide animate-pulse">Đang tải thông tin khiếu nại...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!report) return null;

  const getReportStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "Chờ xử lý";
      case "UNDER_REVIEW": return "Đang xem xét";
      case "RESOLVED": return "Đã giải quyết";
      case "REJECTED": return "Bị từ chối";
      default: return status;
    }
  };

  const getReportReasonLabel = (reason: string) => {
    switch (reason) {
      case "PRODUCT_NOT_AS_DESCRIBED": return "Sản phẩm không đúng mô tả";
      case "DAMAGED_PRODUCT": return "Sản phẩm bị hỏng";
      case "LATE_RETURN": return "Trả đồ trễ hạn";
      case "PAYMENT_DISPUTE": return "Tranh chấp thanh toán";
      case "NO_SHOW": return "Không đến nhận/trả đồ";
      case "OTHER": return "Lý do khác";
      default: return reason;
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "text-red-700 bg-red-100 border-red-200";
      case "UNDER_REVIEW": return "text-orange-700 bg-orange-100 border-orange-200 animate-pulse";
      case "RESOLVED": return "text-green-700 bg-green-100 border-green-200";
      case "REJECTED": return "text-zinc-600 bg-zinc-100 border-zinc-200";
      default: return "text-zinc-700 bg-zinc-100 border-zinc-200";
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <button
                onClick={() => router.push(`/rentals/${report.rentalId}`)}
                className="text-xs font-bold text-zinc-400 hover:text-violet-600 transition-colors flex items-center gap-1 mb-2"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
                Về chi tiết đơn thuê #{report.rentalId}
              </button>
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Chi tiết khiếu nại</h1>
              <p className="text-sm font-semibold text-zinc-500">
                Mã khiếu nại: #{report.id}
              </p>
            </div>
            <span className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider rounded-xl border ${getReportStatusColor(report.status)}`}>
              {getReportStatusLabel(report.status)}
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-150 p-6 sm:p-8 shadow-sm space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-zinc-800 tracking-wide uppercase flex items-center gap-2 border-b border-zinc-100 pb-3">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Thông tin báo cáo
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest block mb-1">Thời gian tạo</span>
                  <span className="text-sm font-bold text-zinc-800">{new Date(report.createdAt).toLocaleString("vi-VN")}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest block mb-1">Lý do</span>
                  <span className="text-sm font-bold text-red-700">{getReportReasonLabel(report.reason)}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest block mb-2">Mô tả chi tiết</span>
                <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 text-sm font-semibold text-zinc-700 leading-relaxed min-h-[100px]">
                  {report.description}
                </div>
              </div>

              {report.evidenceImageUrl && (
                <div>
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest block mb-2">Hình ảnh bằng chứng</span>
                  <a href={report.evidenceImageUrl} target="_blank" rel="noopener noreferrer" className="inline-block relative group rounded-2xl overflow-hidden border border-zinc-200">
                    <img src={report.evidenceImageUrl} alt="Bằng chứng" className="h-48 w-auto object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold text-xs">Mở rộng</span>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {report.adminNote && (
              <div className="bg-violet-50 border border-violet-200 rounded-3xl p-6 space-y-3">
                <h3 className="text-sm font-black text-violet-800 tracking-wide uppercase flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Phản hồi từ quản trị viên
                </h3>
                <div className="text-sm font-semibold text-violet-900 leading-relaxed">
                  {report.adminNote}
                </div>
                {report.resolvedAt && (
                  <div className="text-[10px] text-violet-500 font-bold mt-2">
                    Cập nhật lúc: {new Date(report.resolvedAt).toLocaleString("vi-VN")}
                  </div>
                )}
              </div>
            )}
            
            {report.status === "PENDING" || report.status === "UNDER_REVIEW" ? (
              <div className="text-center py-4 text-xs font-bold text-zinc-500 bg-zinc-50 rounded-2xl border border-zinc-200 border-dashed">
                Quản trị viên đang xem xét khiếu nại của bạn. Vui lòng kiểm tra lại sau.
              </div>
            ) : null}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
