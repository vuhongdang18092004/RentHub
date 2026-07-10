"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import { rentalService } from "@/services/rental-service";
import { ProductDetail } from "@/services/product-service";
import api from "@/lib/axios";

interface BookingWidgetProps {
  product: ProductDetail;
  isOwner: boolean;
  onMessageClick: () => void;
}

export interface BlockedRange {
  startDate: string;
  endDate: string;
}

export function BookingWidget({ product, isOwner, onMessageClick }: BookingWidgetProps) {
  const { user } = useAuth();
  const { triggerToast } = useToast();
  const router = useRouter();

  // Calendar states
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
  const [activeMonthOffset, setActiveMonthOffset] = useState(0);

  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const res = await api.get(`/products/${product.id}/blocked-dates`);
        if (Array.isArray(res.data)) {
          setBlockedRanges(res.data);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách ngày khóa của sản phẩm:", err);
      }
    };
    if (product.id) {
      fetchBlockedDates();
    }
  }, [product.id]);

  // Generate current and next month calendars
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getMonthAndYearWithOffset = (baseDate: Date, offset: number) => {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  };

  const months = [
    getMonthAndYearWithOffset(today, activeMonthOffset),
    getMonthAndYearWithOffset(today, activeMonthOffset + 1),
  ];

  const handlePrevMonths = () => {
    if (activeMonthOffset > 0) {
      setActiveMonthOffset((prev) => prev - 1);
    }
  };

  const handleNextMonths = () => {
    setActiveMonthOffset((prev) => prev + 1);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 = CN, 1 = T2...
  };

  const formatDateToString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const isBlocked = (dayDate: Date) => {
    const d = formatDateToString(dayDate);
    return blockedRanges.some((r) => d >= r.startDate && d <= r.endDate);
  };

  const handleDayClick = (dayDate: Date) => {
    if (dayDate < today || isBlocked(dayDate)) return; // Disabled past and blocked days

    if (!startDate || (startDate && endDate)) {
      setStartDate(dayDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (dayDate < startDate) {
        setStartDate(dayDate);
      } else {
        // Prevent selecting a range that overlaps with blocked dates!
        const hasBlockedInRange = blockedRanges.some((r) => {
          const startStr = formatDateToString(startDate);
          const endStr = formatDateToString(dayDate);
          return (r.startDate >= startStr && r.startDate <= endStr) || (r.endDate >= startStr && r.endDate <= endStr);
        });
        if (hasBlockedInRange) {
          triggerToast("Khoảng ngày bạn chọn chứa những ngày đã bị đặt!");
          return;
        }
        setEndDate(dayDate);
      }
    }
  };

  const isInRange = (dayDate: Date) => {
    if (!startDate || !endDate) return false;
    return dayDate > startDate && dayDate < endDate;
  };

  const isSelected = (dayDate: Date) => {
    if (startDate && dayDate.getTime() === startDate.getTime()) return true;
    if (endDate && dayDate.getTime() === endDate.getTime()) return true;
    return false;
  };

  // Calculate rental price details
  let totalDays = 0;
  let totalPrice = 0;
  if (startDate && endDate) {
    totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    totalPrice = product.pricePerDay * totalDays;
  }

  const handleBookNow = async () => {
    if (!user) {
      triggerToast("Vui lòng đăng nhập để gửi yêu cầu thuê");
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    if (!startDate || !endDate) {
      triggerToast("Vui lòng chọn ngày nhận và trả đồ!");
      return;
    }

    try {
      setBookingLoading(true);
      await rentalService.createRentalRequest({
        productId: product.id,
        startDate: formatDateToString(startDate),
        endDate: formatDateToString(endDate),
        message: `Yêu cầu thuê từ ${formatDateToString(startDate)} đến ${formatDateToString(endDate)}`,
      });
      triggerToast("Đã gửi yêu cầu thuê! ✅");
      setStartDate(null);
      setEndDate(null);
      setTimeout(() => router.push("/rentals/renter"), 1000);
    } catch (err: any) {
      console.error("Lỗi đặt lịch:", err);
      triggerToast(err.response?.data?.message || "Đặt lịch thất bại. Vui lòng thử lại!");
    } finally {
      setBookingLoading(false);
    }
  };

  const monthNames = [
    "Tháng Một", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu",
    "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Mười Hai"
  ];

  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const productAvailable = product.status === "AVAILABLE";

  return (
    <div className="bg-white border border-zinc-150 rounded-3xl p-6 shadow-sm sticky top-24 flex flex-col max-h-[calc(100vh-120px)]">
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2 space-y-6 scrollbar-hide pb-2">
        {/* Calendar Header Title with Nav Buttons */}
        <div className="flex justify-between items-center pb-2 border-b border-zinc-100 select-none">
          <button
            type="button"
            disabled={activeMonthOffset === 0}
            onClick={handlePrevMonths}
            className={`p-1.5 rounded-lg border border-zinc-200 bg-white transition-colors cursor-pointer ${
              activeMonthOffset === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-zinc-50"
            }`}
          >
            <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="font-extrabold text-xs text-zinc-700 uppercase tracking-wider">
            {monthNames[months[0].month]} {months[0].year} — {monthNames[months[1].month]} {months[1].year}
          </div>
          <button
            type="button"
            onClick={handleNextMonths}
            className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Side-by-side Months */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {months.map(({ year, month }, mIdx) => {
            const daysInMonth = getDaysInMonth(year, month);
            const firstDay = getFirstDayOfMonth(year, month);
            const blanks = Array(firstDay).fill(null);
            const days = Array.from({ length: daysInMonth }).map((_, i) => new Date(year, month, i + 1));

            return (
              <div key={mIdx} className="space-y-3">
                <div className="text-center text-xs font-extrabold text-zinc-500">
                  {monthNames[month]} {year}
                </div>
                <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-semibold text-zinc-400">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="py-1">{day}</div>
                  ))}
                  {blanks.map((_, i) => (
                    <div key={`blank-${i}`} />
                  ))}
                  {days.map((dayDate) => {
                    const isPast = dayDate < today;
                    const blocked = isBlocked(dayDate);
                    const selected = isSelected(dayDate);
                    const inRange = isInRange(dayDate);
                    const isStart = startDate && dayDate.getTime() === startDate.getTime();
                    const isEnd = endDate && dayDate.getTime() === endDate.getTime();

                    return (
                      <button
                        key={dayDate.getDate()}
                        disabled={isPast || blocked}
                        onClick={() => handleDayClick(dayDate)}
                        className={`h-7 w-7 mx-auto rounded-full text-[10px] font-bold transition-all relative flex items-center justify-center select-none ${
                          isPast
                            ? "text-zinc-300 cursor-not-allowed"
                            : blocked
                            ? "bg-zinc-200 text-zinc-400 cursor-not-allowed line-through"
                            : selected
                            ? "bg-violet-600 text-white"
                            : inRange
                            ? "bg-violet-50 text-violet-700"
                            : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                        }`}
                      >
                        {dayDate.getDate()}
                        {selected && (
                          <span className="absolute bottom-0.5 w-1 h-1 bg-white rounded-full"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-500 font-semibold border-t border-b border-zinc-100 py-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-violet-600"></span>
            <span>Đã chọn</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-violet-50 border border-violet-100"></span>
            <span>Trong khoảng</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-zinc-200 border border-zinc-300 inline-flex items-center justify-center text-[8px] text-zinc-400 font-black line-through">✓</span>
            <span>Đã đặt</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-zinc-100"></span>
            <span>Trống</span>
          </div>
        </div>

        {/* Checkin / Checkout date summaries */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-zinc-150 rounded-xl p-3 bg-zinc-50/50">
            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider">NHẬN</label>
            <span className="text-xs font-extrabold text-zinc-700 mt-1 block">
              {startDate ? formatDateToString(startDate) : "—"}
            </span>
          </div>
          <div className="border border-zinc-150 rounded-xl p-3 bg-zinc-50/50">
            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider">TRẢ</label>
            <span className="text-xs font-extrabold text-zinc-700 mt-1 block">
              {endDate ? formatDateToString(endDate) : "—"}
            </span>
          </div>
        </div>

        {/* Pricing Summary */}
        {startDate && endDate && (
          <div className="bg-violet-50/50 border border-violet-100/50 rounded-xl p-4 flex justify-between items-center text-xs font-semibold text-zinc-700 animate-fade-in">
            <div>
              {product.pricePerDay.toLocaleString("vi-VN")}đ × {totalDays} ngày
            </div>
            <div className="font-black text-violet-700 text-sm">
              {totalPrice.toLocaleString("vi-VN")}đ
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Sticky at bottom */}
      <div className="space-y-2 shrink-0 pt-4 border-t border-zinc-100 mt-2">
        {isOwner ? (
          <div className="text-center py-3 bg-zinc-100 text-zinc-500 rounded-xl text-xs font-bold select-none border border-zinc-200">
            Đây là sản phẩm của bạn
          </div>
        ) : (
          <div className="flex gap-2">
            {/* Book Now Button */}
            <button
              disabled={!productAvailable || bookingLoading}
              onClick={handleBookNow}
              className={`flex-1 py-3 rounded-xl text-xs font-extrabold shadow-sm transition-all text-center select-none ${
                !productAvailable
                  ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                  : bookingLoading
                  ? "bg-violet-500 text-white cursor-wait"
                  : "bg-violet-600 hover:bg-violet-700 text-white cursor-pointer hover:shadow-md active:scale-[0.99]"
              }`}
            >
              {bookingLoading ? "Đang xử lý..." : productAvailable ? "Đặt ngay" : "Không khả dụng"}
            </button>

            {/* Message Button */}
            <button
              onClick={onMessageClick}
              className="px-4 py-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:shadow-sm active:scale-[0.99]"
              title="Nhắn tin với chủ đồ"
            >
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Nhắn tin</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
