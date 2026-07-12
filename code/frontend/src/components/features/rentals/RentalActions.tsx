import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RentalDetailResponse } from "@/types/backend";
import { rentalService } from "@/services/rental-service";
import { useToast } from "@/context/ToastContext";
import { paymentService } from "@/services/payment-service";
import { reviewService } from "@/services/review-service";

interface RentalActionsProps {
  rental: RentalDetailResponse;
  isOwner: boolean;
  isLocked: boolean;
  isPaid?: boolean;
  refundAmount?: number;
  onRefresh: () => void;
}

export function RentalActions({ rental, isOwner, isLocked, isPaid, refundAmount, onRefresh }: RentalActionsProps) {
  const router = useRouter();
  const { triggerToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [qrDataURL, setQrDataURL] = useState("");
  const [isConfirmingRefund, setIsConfirmingRefund] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleOpenRefundModal = async () => {
    setShowRefundModal(true);
    if (!refundAmount) return;
    try {
      const res = await fetch("/api/vietqr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: refundAmount,
          content: `Hoan tien thue do ${rental.id}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setQrDataURL(data.qrDataURL);
      } else {
        triggerToast("Không thể tải mã QR");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Lỗi kết nối mã QR");
    }
  };

  const handleConfirmRefund = async () => {
    try {
      setIsConfirmingRefund(true);
      const totalPossible = rental.totalPrice + rental.depositAmount;
      const isFullRefund = refundAmount && refundAmount >= totalPossible;
      const pType = isFullRefund ? "REFUND_CANCEL" : "REFUND_DEPOSIT";

      await paymentService.recordRefund({
        rentalId: rental.id,
        paymentType: pType,
        amount: refundAmount || 0,
        transactionCode: `RF_${rental.id}_${Date.now()}`
      });
      triggerToast("Đã xác nhận hoàn tiền thành công!");
      setShowRefundModal(false);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || "Lỗi xác nhận hoàn tiền");
    } finally {
      setIsConfirmingRefund(false);
    }
  };

  const handleAction = async (
    action: () => Promise<any>,
    confirmMessage: string,
    successMessage: string
  ) => {
    if (!window.confirm(confirmMessage)) return;
    try {
      setLoading(true);
      await action();
      triggerToast(successMessage);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      triggerToast("Vui lòng nhập nội dung đánh giá");
      return;
    }
    try {
      setIsSubmittingReview(true);
      await reviewService.createReview({
        rentalId: rental.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      triggerToast("Cảm ơn bạn đã đánh giá! ⭐");
      setShowReviewModal(false);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || "Lỗi khi gửi đánh giá");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLocked) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm text-center">
        <h3 className="text-red-700 font-black text-sm uppercase tracking-wide">Đơn thuê đang bị khóa</h3>
        <p className="text-red-600 text-xs font-bold mt-2">
          Đơn thuê này đang có khiếu nại chưa được giải quyết. Bạn không thể thực hiện các thao tác chuyển trạng thái cho đến khi quản trị viên giải quyết xong.
        </p>
      </div>
    );
  }

  const renderRenterActions = () => {
    switch (rental.status) {
      case "WAITING_PAYMENT":
        if (isPaid) {
          return (
            <div className="w-full py-4 bg-zinc-100 text-zinc-500 rounded-2xl text-sm font-black text-center uppercase tracking-wider select-none border border-zinc-200">
              Đã thanh toán. Chờ chủ đồ bàn giao
            </div>
          );
        }
        return (
          <button
            onClick={() => router.push(`/checkout?requestId=${rental.requestId || rental.id}`)}
            className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            Thanh toán ngay
          </button>
        );
      case "HANDOVER_PENDING":
        return (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              disabled={loading}
              onClick={() => handleAction(
                () => rentalService.rejectRental(rental.id),
                "Bạn muốn từ chối nhận món đồ này? Lưu ý: Điều này sẽ tạo một khiếu nại lên hệ thống.",
                "Đã từ chối nhận đồ. Đơn thuê đang được xem xét! ❌"
              )}
              className="flex-1 py-4 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              Từ chối nhận đồ
            </button>
            <button
              disabled={loading}
              onClick={() => handleAction(
                () => rentalService.receiveRental(rental.id),
                "Xác nhận bạn đã nhận được đồ và đồ trong tình trạng tốt?",
                "Đã xác nhận nhận đồ. Bắt đầu thời gian thuê! 🎉"
              )}
              className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              Xác nhận nhận đồ
            </button>
          </div>
        );
      case "ACTIVE":
        return (
          <button
            disabled={loading}
            onClick={() => handleAction(
              () => rentalService.returnRental(rental.id),
              "Bạn đã sử dụng xong và muốn yêu cầu trả đồ?",
              "Đã yêu cầu trả đồ. Vui lòng chờ chủ đồ xác nhận! 📤"
            )}
            className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 animate-[pulse_2s_infinite]"
          >
            Yêu cầu trả đồ
          </button>
        );
      case "RETURN_PENDING":
        return (
          <div className="w-full py-4 bg-zinc-100 text-zinc-500 rounded-2xl text-sm font-black text-center uppercase tracking-wider select-none border border-zinc-200">
            Đang chờ chủ đồ xác nhận
          </div>
        );
      case "REFUND_PENDING":
        return (
          <div className="w-full py-4 bg-red-50 text-red-600 rounded-2xl text-sm font-black text-center uppercase tracking-wider select-none border border-red-200">
            Đang chờ chủ đồ hoàn tiền ({refundAmount?.toLocaleString("vi-VN")}đ)
          </div>
        );
      case "COMPLETED":
        if (rental.canReview) {
          return (
            <button
              onClick={() => setShowReviewModal(true)}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              Viết đánh giá
            </button>
          );
        }
        if (rental.reviewed) {
          return (
            <div className="w-full py-4 bg-zinc-100 text-zinc-500 rounded-2xl text-sm font-black text-center uppercase tracking-wider select-none border border-zinc-200 flex items-center justify-center gap-2">
              <span className="text-amber-500">★</span> Đã đánh giá
            </div>
          );
        }
        return null;
      default:
        return null;
    }
  };

  const renderOwnerActions = () => {
    switch (rental.status) {
      case "WAITING_PAYMENT":
        if (!isPaid) {
          return (
            <div className="w-full py-4 bg-zinc-100 text-zinc-500 rounded-2xl text-sm font-black text-center uppercase tracking-wider select-none border border-zinc-200">
              Đang chờ người thuê thanh toán
            </div>
          );
        }
        return (
          <button
            disabled={loading}
            onClick={() => handleAction(
              () => rentalService.handoverRental(rental.id),
              "Xác nhận bạn đã bàn giao đồ cho người thuê?",
              "Đã xác nhận bàn giao đồ! 🤝"
            )}
            className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            Xác nhận bàn giao
          </button>
        );
      case "HANDOVER_PENDING":
        return (
          <div className="w-full py-4 bg-zinc-100 text-zinc-500 rounded-2xl text-sm font-black text-center uppercase tracking-wider select-none border border-zinc-200">
            Chờ người thuê xác nhận
          </div>
        );
      case "ACTIVE":
        return (
          <div className="w-full py-4 bg-zinc-100 text-zinc-500 rounded-2xl text-sm font-black text-center uppercase tracking-wider select-none border border-zinc-200">
            Đang cho thuê
          </div>
        );
      case "RETURN_PENDING":
        return (
          <button
            disabled={loading}
            onClick={() => handleAction(
              () => rentalService.completeRental(rental.id),
              "Xác nhận bạn đã nhận lại đồ an toàn và hoàn tất giao dịch?",
              "Đã xác nhận hoàn tất giao dịch! 🎉"
            )}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 animate-[pulse_2s_infinite]"
          >
            Xác nhận hoàn tất
          </button>
        );
      case "REFUND_PENDING":
        return (
          <button
            disabled={loading}
            onClick={handleOpenRefundModal}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 animate-[pulse_2s_infinite]"
          >
            Hoàn tiền cho người thuê ({refundAmount?.toLocaleString("vi-VN")}đ)
          </button>
        );
      default:
        return null;
    }
  };

  const actions = isOwner ? renderOwnerActions() : renderRenterActions();

  if (!actions) return null;

  return (
    <>
      <div className="bg-white rounded-3xl border border-zinc-150 p-6 shadow-sm">
        {actions}
      </div>

      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
            <button
              onClick={() => setShowRefundModal(false)}
              aria-label="Đóng"
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-black text-zinc-900 mb-2">Quét mã để hoàn tiền</h3>
            <p className="text-sm text-zinc-500 mb-6 text-center">Vui lòng quét mã VietQR bằng ứng dụng ngân hàng để hoàn trả <strong className="text-red-600">{refundAmount?.toLocaleString("vi-VN")}đ</strong> cho người thuê.</p>
            
            <div className="w-64 h-64 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6 overflow-hidden border border-zinc-200">
              {qrDataURL ? (
                <img src={qrDataURL} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

            <button
              disabled={isConfirmingRefund}
              onClick={handleConfirmRefund}
              className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {isConfirmingRefund ? "Đang xử lý..." : "Xác nhận đã chuyển khoản"}
            </button>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl relative overflow-hidden flex flex-col">
            <button
              onClick={() => setShowReviewModal(false)}
              aria-label="Đóng"
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-black text-zinc-900 mb-2 text-center">Đánh giá sản phẩm</h3>
            <p className="text-sm text-zinc-500 mb-6 text-center">Hãy chia sẻ trải nghiệm của bạn với món đồ này nhé.</p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  aria-label={`${star} sao`}
                  className={`text-4xl transition-transform hover:scale-110 focus:outline-none ${star <= reviewRating ? "text-amber-400" : "text-zinc-200"}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Sản phẩm dùng tốt không? Chủ đồ có hỗ trợ nhiệt tình không?"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 mb-6 resize-none h-32"
            />

            <button
              disabled={isSubmittingReview}
              onClick={handleSubmitReview}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
