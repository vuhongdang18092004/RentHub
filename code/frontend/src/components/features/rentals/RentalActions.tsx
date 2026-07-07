import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RentalDetailResponse } from "@/types/backend";
import { rentalService } from "@/services/rental-service";
import { useToast } from "@/context/ToastContext";

interface RentalActionsProps {
  rental: RentalDetailResponse;
  isOwner: boolean;
  isLocked: boolean;
  isPaid?: boolean;
  onRefresh: () => void;
}

export function RentalActions({ rental, isOwner, isLocked, isPaid, onRefresh }: RentalActionsProps) {
  const router = useRouter();
  const { triggerToast } = useToast();
  const [loading, setLoading] = useState(false);

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
            onClick={() => router.push(`/checkout?requestId=${rental.id}`)}
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
      default:
        return null;
    }
  };

  const actions = isOwner ? renderOwnerActions() : renderRenterActions();

  if (!actions) return null;

  return (
    <div className="bg-white rounded-3xl border border-zinc-150 p-6 shadow-sm">
      {actions}
    </div>
  );
}
