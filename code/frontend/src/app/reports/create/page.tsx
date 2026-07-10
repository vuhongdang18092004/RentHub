"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useToast } from "@/context/ToastContext";
import { reportService } from "@/services/report-service";
import { rentalService } from "@/services/rental-service";
import { ReportReason } from "@/types/backend";
import { ArrowLeft, Loader2, Send } from "lucide-react";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "PRODUCT_NOT_AS_DESCRIBED", label: "Sản phẩm không đúng mô tả" },
  { value: "DAMAGED_PRODUCT", label: "Sản phẩm bị hỏng" },
  { value: "LATE_RETURN", label: "Trả đồ trễ hạn" },
  { value: "PAYMENT_DISPUTE", label: "Tranh chấp thanh toán" },
  { value: "NO_SHOW", label: "Không đến nhận/trả đồ" },
  { value: "OTHER", label: "Lý do khác" },
];

function CreateReportContent() {
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
  }, [rentalId, triggerToast]);

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
      triggerToast("Đã tạo khiếu nại thành công! Quản trị viên sẽ sớm xem xét.");
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
          <div className="space-y-2">
            <button
              onClick={() => router.back()}
              className="text-sm font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-500">Tạo khiếu nại</h1>
            <p className="text-sm font-medium text-secondary">
              Hãy mô tả chi tiết vấn đề của bạn để Ban Quản Trị có thể xử lý thỏa đáng nhất.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-primary border border-secondary rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary block">Lý do khiếu nại <span className="text-red-500">*</span></label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full bg-primary border border-secondary rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 cursor-pointer transition-colors"
              >
                {availableReasons.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary block">Mô tả chi tiết <span className="text-red-500">*</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Hãy giải thích rõ chuyện gì đã xảy ra..."
                className="w-full h-32 bg-primary border border-secondary rounded-xl px-4 py-3 text-sm font-medium text-primary placeholder:text-tertiary focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none transition-colors"
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary block">Link ảnh bằng chứng (Tùy chọn)</label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-primary border border-secondary rounded-xl px-4 py-3 text-sm font-medium text-primary placeholder:text-tertiary focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>

            <div className="pt-6 border-t border-secondary flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3.5 bg-secondary hover:bg-tertiary text-primary font-semibold rounded-xl text-sm transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-[2] py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Gửi khiếu nại
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function CreateReportPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-2xl mx-auto flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    }>
      <CreateReportContent />
    </Suspense>
  );
}
