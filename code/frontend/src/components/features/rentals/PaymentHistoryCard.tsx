import React, { useEffect, useState } from "react";
import { PaymentResponse } from "@/types/backend";
import { paymentService } from "@/services/payment-service";

interface PaymentHistoryCardProps {
  rentalId: number;
}

export function PaymentHistoryCard({ rentalId }: PaymentHistoryCardProps) {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await paymentService.getPaymentsByRental(rentalId, 0, 100);
        setPayments(res.content);
      } catch (err) {
        console.error("Lỗi lấy lịch sử thanh toán:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [rentalId]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-zinc-150 p-6 shadow-sm flex items-center justify-center min-h-[150px]">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (payments.length === 0) {
    return null; // Don't show if there's no payment
  }

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "DEPOSIT": return "Tiền cọc";
      case "RENTAL_FEE": return "Phí thuê";
      case "REFUND_CANCEL": return "Hoàn tiền (Huỷ)";
      case "REFUND_DEPOSIT": return "Hoàn cọc";
      default: return type;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS": return "text-green-600 bg-green-50 border-green-200";
      case "PENDING": return "text-amber-600 bg-amber-50 border-amber-200";
      case "FAILED": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-zinc-600 bg-zinc-50 border-zinc-200";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-150 p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-black text-zinc-800 tracking-wide uppercase flex items-center gap-2">
        <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        Lịch sử giao dịch
      </h3>

      <div className="space-y-3">
        {payments.map((payment) => (
          <div key={payment.id} className="flex justify-between items-center p-3 border border-zinc-150 rounded-2xl bg-zinc-50/50 hover:bg-white hover:shadow-sm transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-800">{getPaymentTypeLabel(payment.paymentType)}</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getPaymentStatusColor(payment.status)}`}>
                  {payment.status === "SUCCESS" ? "Thành công" : payment.status === "PENDING" ? "Đang xử lý" : "Thất bại"}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-semibold">
                {new Date(payment.paidAt || new Date()).toLocaleString("vi-VN")} • {payment.paymentMethod}
              </p>
            </div>
            <div className="text-sm font-black text-violet-700">
              {payment.paymentType.startsWith("REFUND") ? "+" : "-"}{payment.amount.toLocaleString("vi-VN")}đ
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
