import React from "react";
import { RentalDetailResponse } from "@/types/backend";

interface RentalInformationCardProps {
  rental: RentalDetailResponse;
}

export function RentalInformationCard({ rental }: RentalInformationCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-zinc-150 p-6 shadow-sm space-y-6">
      <h3 className="text-sm font-black text-zinc-800 tracking-wide uppercase flex items-center gap-2">
        <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Thông tin chi tiết
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-zinc-100">
          <span className="text-xs font-bold text-zinc-500">Giá thuê theo ngày</span>
          <span className="text-sm font-extrabold text-zinc-800">{rental.pricePerDay.toLocaleString("vi-VN")}đ</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-zinc-100">
          <span className="text-xs font-bold text-zinc-500">Số ngày thuê</span>
          <span className="text-sm font-extrabold text-zinc-800">{rental.rentalDays} ngày</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-zinc-100">
          <span className="text-xs font-bold text-zinc-500">Tiền cọc (hoàn trả sau)</span>
          <span className="text-sm font-extrabold text-zinc-800">{rental.depositAmount.toLocaleString("vi-VN")}đ</span>
        </div>
        <div className="flex justify-between items-center py-3 bg-violet-50/50 -mx-6 px-6 border-y border-violet-100">
          <span className="text-xs font-black text-violet-700 uppercase tracking-widest">Tổng thanh toán</span>
          <span className="text-lg font-black text-violet-700">{rental.totalPrice.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>

      <div className="pt-2">
        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Địa điểm nhận & trả đồ</h4>
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-700 leading-relaxed">
              {rental.product.address || "Chưa cập nhật địa chỉ"}
            </p>
            <p className="text-[10px] font-semibold text-zinc-500 mt-1">
              Vui lòng liên hệ trực tiếp với chủ đồ để hẹn giờ chính xác.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
