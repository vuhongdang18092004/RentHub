"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useToast } from "@/context/ToastContext";
import { reportService } from "@/services/report-service";
import { rentalService } from "@/services/rental-service";
import { ReportReason } from "@/types/backend";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "PRODUCT_NOT_AS_DESCRIBED", label: "Sản phẩm không đúng mô tả" },
  { value: "DAMAGED_PRODUCT", label: "Sản phẩm bị hỏng" },
  { value: "LATE_RETURN", label: "Trả đồ trễ hạn" },
  { value: "PAYMENT_DISPUTE", label: "Tranh chấp thanh toán" },
  { value: "NO_SHOW", label: "Không đến nhận/trả đồ" },
  { value: "OTHER", label: "Lý do khác" },
];

export default function CreateReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rentalId = searchParams ? searchParams.get("rentalId") : null;
  const { triggerToast } = useToast();

  const [rentalStatus, setRentalStatus] = useState<string | null>(null);
  const [reason, setReason] = useState<ReportReason>("OTHER");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (rentalId) {
      rentalService.getRentalDetail(parseInt(rentalId))
        .then((res) => {
          setRentalStatus(res.status);
        })
        .catch((err) => {
          console.error(err);
          triggerToast("Không thể tải thông tin đơn thuê!");
        });
    }
  }, [rentalId]);

  const availableReasons = REASONS.filter((r) => {
    if (r.value === "PRODUCT_NOT_AS_DESCRIBED") return rentalStatus === "HANDOVER_PENDING";
    if (r.value === "DAMAGED_PRODUCT" || r.value === "LATE_RETURN") return rentalStatus === "RETURN_PENDING";
    if (r.value === "PAYMENT_DISPUTE" || r.value === "NO_SHOW") return rentalStatus === "WAITING_PAYMENT" || rentalStatus === "HANDOVER_PENDING";
    return true; 
  });

  useEffect(() => {
    if (availableReasons.length > 0 && !availableReasons.find((r) => r.value === reason)) {
      setReason(availableReasons[0].value);
    }
  }, [availableReasons, reason]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rentalId) {
      triggerToast("Không tìm thấy mã đơn thuê hợp lệ!");
      return;
    }
    if (!description.trim()) {
      triggerToast("Vui lòng nhập mô tả chi tiết vấn đề!");
      return;
    }

    try {
      setSubmitting(true);
      const res = await reportService.createReport({
        rentalId: parseInt(rentalId),
        reason,
        description,
        evidenceImageUrl: evidenceUrl || undefined,
      });
      triggerToast("Đã tạo khiếu nại thành công! Quản trị viên sẽ sớm xem xét. ⚖️");
      router.push(`/reports/${res.id}`);
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || "Tạo khiếu nại thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-1">
            <button
              onClick={() => router.back()}
              className="text-xs font-bold text-zinc-400 hover:text-violet-600 transition-colors flex items-center gap-1 mb-2"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            <h1 className="text-2xl font-black text-red-700 tracking-tight">Tạo khiếu nại</h1>
            <p className="text-sm font-semibold text-zinc-500">
              Hãy mô tả chi tiết vấn đề của bạn để Ban Quản Trị có thể xử lý thỏa đáng nhất.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-widest block">Lý do khiếu nại</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              >
                {availableReasons.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-widest block">Mô tả chi tiết</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Hãy giải thích rõ chuyện gì đã xảy ra..."
                className="w-full h-32 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-widest block">Link ảnh bằng chứng (Tùy chọn)</label>
              <input
                type="text"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="pt-4 border-t border-zinc-100 flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3.5 bg-zinc-100 text-zinc-600 font-extrabold rounded-2xl text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3.5 bg-red-600 text-white font-black rounded-2xl text-sm uppercase tracking-wider hover:bg-red-700 transition-colors shadow-md disabled:opacity-50"
              >
                {submitting ? "Đang gửi..." : "Gửi khiếu nại"}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
