import React, { useEffect, useState } from "react";
import { ReportResponse } from "@/types/backend";
import { reportService } from "@/services/report-service";

interface ReportHistoryCardProps {
  rentalId: number;
}

export function ReportHistoryCard({ rentalId }: ReportHistoryCardProps) {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await reportService.getMyReports(0, 100);
        // Filter by rentalId since we don't have a direct endpoint
        const filtered = (res.content || []).filter((r) => r.rentalId === rentalId);
        setReports(filtered);
      } catch (err) {
        console.error("Lỗi lấy danh sách khiếu nại:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [rentalId]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-zinc-150 p-6 shadow-sm flex items-center justify-center min-h-[150px]">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (reports.length === 0) {
    return null; // Don't show if there's no report
  }

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
      case "PENDING": return "text-red-600 bg-red-50 border-red-200";
      case "UNDER_REVIEW": return "text-orange-600 bg-orange-50 border-orange-200 animate-pulse";
      case "RESOLVED": return "text-green-600 bg-green-50 border-green-200";
      case "REJECTED": return "text-zinc-500 bg-zinc-50 border-zinc-200";
      default: return "text-zinc-600 bg-zinc-50 border-zinc-200";
    }
  };

  return (
    <div className="bg-red-50/30 rounded-3xl border border-red-100 p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-black text-red-800 tracking-wide uppercase flex items-center gap-2">
        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Khiếu nại / Tranh chấp
      </h3>

      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="flex flex-col gap-2 p-3 border border-red-100 rounded-2xl bg-white hover:shadow-sm transition-all">
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs font-bold text-zinc-800 line-clamp-1">{getReportReasonLabel(report.reason)}</span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${getReportStatusColor(report.status)}`}>
                {getReportStatusLabel(report.status)}
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed bg-zinc-50 p-2 rounded-xl">
              {report.description}
            </p>
            {report.adminNote && (
              <p className="text-[10px] text-violet-700 bg-violet-50 p-2 rounded-xl border border-violet-100 font-semibold">
                <span className="font-black uppercase tracking-wider block mb-0.5">Admin phản hồi:</span>
                {report.adminNote}
              </p>
            )}
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider text-right">
              {new Date(report.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
