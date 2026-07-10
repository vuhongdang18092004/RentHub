"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { rentalService } from "@/services/rental-service";
import { reportService } from "@/services/report-service";
import { paymentService } from "@/services/payment-service";
import { RentalDetailResponse } from "@/types/backend";

import { RentalHeader } from "@/components/features/rentals/RentalHeader";
import { RentalTimeline } from "@/components/features/rentals/RentalTimeline";
import { RentalInformationCard } from "@/components/features/rentals/RentalInformationCard";
import { RentalActions } from "@/components/features/rentals/RentalActions";
import { PaymentHistoryCard } from "@/components/features/rentals/PaymentHistoryCard";
import { ReportHistoryCard } from "@/components/features/rentals/ReportHistoryCard";

export default function RentalDetailPage() {
  const params = useParams();
  const rentalId = Number(params?.id || 0);
  const router = useRouter();
  const { user } = useAuth();
  const { triggerToast } = useToast();

  const [rental, setRental] = useState<RentalDetailResponse | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchRentalData = async () => {
    if (!rentalId) return;
    try {
      setLoading(true);
      // Fetch Rental Detail
      const rentalData = await rentalService.getRentalDetail(rentalId);
      setRental(rentalData);

      // Fetch Reports to determine lock status
      const reportsData = await reportService.getMyReports(0, 100);
      const rentalReports = (reportsData.content || []).filter((r) => r.rentalId === rentalId);
      
      const hasUnresolvedReport = rentalReports.some(
        (r) => r.status === "PENDING" || r.status === "UNDER_REVIEW"
      );
      setIsLocked(hasUnresolvedReport);

      // Find refund amount if status is REFUND_PENDING
      if (rentalData.status === "REFUND_PENDING") {
        const resolvedReport = rentalReports.find(r => r.status === "RESOLVED" && r.adminNote?.includes("REFUND_AMOUNT"));
        if (resolvedReport && resolvedReport.adminNote) {
          const match = resolvedReport.adminNote.match(/REFUND_AMOUNT=([0-9.]+)/);
          if (match && match[1]) {
            setRefundAmount(Number(match[1]));
          }
        }
      }

      // Fetch Payments to determine if paid
      const paymentsData = await paymentService.getPaymentsByRental(rentalId, 0, 100);
      const hasSuccessPayment = (paymentsData.content || []).some(
        (p) => p.status === "SUCCESS"
      );
      setIsPaid(hasSuccessPayment);
      
    } catch (err: any) {
      console.error("Lỗi lấy chi tiết đơn thuê:", err);
      triggerToast("Không thể tải thông tin đơn thuê hoặc bạn không có quyền truy cập!");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalData();
  }, [rentalId]);

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-zinc-500 font-bold tracking-wide animate-pulse">Đang tải thông tin đơn thuê...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!rental || !user) {
    return null;
  }

  const isOwner = user.id === rental.owner.id;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 max-w-5xl mx-auto font-sans pb-12">
          {/* Main Title & Breadcrumbs */}
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
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Chi tiết đơn thuê</h1>
          </div>

          <RentalHeader rental={rental} isOwner={isOwner} isLocked={isLocked} isPaid={isPaid} />
          
          <RentalTimeline status={rental.status} isPaid={isPaid} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Information & History) */}
            <div className="lg:col-span-2 space-y-6">
              <RentalInformationCard rental={rental} />
              <PaymentHistoryCard rentalId={rental.id} />
              <ReportHistoryCard rentalId={rental.id} />
            </div>

            {/* Right Column (Actions) */}
            <div className="space-y-6">
              <RentalActions 
                rental={rental} 
                isOwner={isOwner} 
                isLocked={isLocked} 
                isPaid={isPaid}
                refundAmount={refundAmount}
                onRefresh={fetchRentalData} 
              />
              
              {/* Report/Dispute button shortcut (only if active/handover_pending) */}
              {!isLocked && rental.status !== "COMPLETED" && rental.status !== "CANCELLED" && rental.status !== "WAITING_PAYMENT" && (
                <div className="bg-red-50/50 rounded-3xl border border-red-100 p-6 flex flex-col items-center text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-red-800 uppercase tracking-wide">Bạn gặp vấn đề?</h4>
                    <p className="text-[10px] text-red-600/80 mt-1 font-bold">Hãy tạo khiếu nại để quản trị viên giải quyết nếu có tranh chấp xảy ra.</p>
                  </div>
                  <button
                    onClick={() => router.push(`/reports/create?rentalId=${rental.id}`)}
                    className="w-full py-3 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-[0.99] mt-2 cursor-pointer"
                  >
                    Tạo khiếu nại
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
