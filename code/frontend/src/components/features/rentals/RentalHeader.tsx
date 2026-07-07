import React from "react";
import { RentalDetailResponse } from "@/types/backend";

interface RentalHeaderProps {
  rental: RentalDetailResponse;
  isOwner: boolean;
  isLocked: boolean;
  isPaid: boolean;
}

export function RentalHeader({ rental, isOwner, isLocked, isPaid }: RentalHeaderProps) {
  const getStatusDisplay = () => {
    if (isLocked) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-700 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-red-200">
          ĐANG BỊ KHÓA (CÓ TRANH CHẤP)
        </span>
      );
    }
    switch (rental.status) {
      case "WAITING_PAYMENT":
        if (isPaid) {
          return (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-blue-200">
              Đã thanh toán - Chờ xác nhận bàn giao
            </span>
          );
        }
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-yellow-200">
            Chờ thanh toán
          </span>
        );
      case "HANDOVER_PENDING":
        return (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-orange-200">
            Chờ nhận đồ
          </span>
        );
      case "ACTIVE":
        return (
          <span className="px-3 py-1 bg-violet-100 text-violet-700 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-violet-200">
            Đang thuê
          </span>
        );
      case "RETURN_PENDING":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-blue-200 animate-pulse">
            Đang trả đồ
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-green-200">
            Hoàn thành
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-3 py-1 bg-zinc-100 text-zinc-500 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-zinc-200">
            Đã huỷ
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-150 p-6 flex flex-col md:flex-row gap-6 shadow-sm">
      <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-100 rounded-2xl overflow-hidden shrink-0 border border-zinc-200 relative">
        {rental.product.primaryImageUrl ? (
          <img src={rental.product.primaryImageUrl} alt={rental.product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
        )}
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <h1 className="text-xl md:text-2xl font-black text-zinc-900 leading-tight">
              {rental.product.name}
            </h1>
            {getStatusDisplay()}
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            MÃ ĐƠN THUÊ: <span className="text-zinc-700">#{rental.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-black flex items-center justify-center text-xs">
              {isOwner ? rental.renter.fullName.charAt(0) : rental.owner.fullName.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase">{isOwner ? "NGƯỜI THUÊ" : "CHỦ ĐỒ"}</p>
              <p className="text-zinc-700">{isOwner ? rental.renter.fullName : rental.owner.fullName}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-zinc-200"></div>
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">THỜI GIAN THUÊ</p>
            <p className="text-zinc-700">
              {new Date(rental.startDate).toLocaleDateString("vi-VN")} - {new Date(rental.endDate).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
