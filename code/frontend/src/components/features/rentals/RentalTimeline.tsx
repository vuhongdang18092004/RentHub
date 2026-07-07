import React from "react";
import { RentalStatus } from "@/types/backend";

interface RentalTimelineProps {
  status: RentalStatus;
  isPaid?: boolean;
}

const steps = [
  { key: "WAITING_PAYMENT", label: "Chờ thanh toán" },
  { key: "HANDOVER_PENDING", label: "Chờ bàn giao" },
  { key: "ACTIVE", label: "Đang thuê" },
  { key: "RETURN_PENDING", label: "Đang trả đồ" },
  { key: "COMPLETED", label: "Hoàn thành" },
];

export function RentalTimeline({ status, isPaid }: RentalTimelineProps) {
  if (status === "CANCELLED") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h3 className="text-red-700 font-black text-lg">Đơn thuê đã bị hủy</h3>
          <p className="text-red-500 text-xs font-bold mt-1">Giao dịch đã kết thúc và không thể tiếp tục.</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="bg-white rounded-3xl border border-zinc-150 p-6 shadow-sm overflow-x-auto">
      <div className="min-w-[600px] flex items-center justify-between relative px-4">
        {/* Progress bar background */}
        <div className="absolute top-1/2 left-8 right-8 h-1 bg-zinc-100 -translate-y-1/2 rounded-full z-0"></div>
        {/* Active progress bar */}
        <div 
          className="absolute top-1/2 left-8 h-1 bg-violet-600 -translate-y-1/2 rounded-full z-0 transition-all duration-500"
          style={{ width: `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 16px)` }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-3">
              <div 
                className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all ${
                  isCompleted ? "bg-violet-600 border-white text-white" : 
                  isCurrent ? "bg-white border-violet-600 text-violet-600 shadow-md scale-110" : 
                  "bg-white border-zinc-200 text-zinc-300"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? "bg-violet-600" : "bg-zinc-200"}`}></div>
                )}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                isCompleted || isCurrent ? "text-zinc-800" : "text-zinc-400"
              }`}>
                {step.key === "WAITING_PAYMENT" && isPaid ? "Đã thanh toán" : step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
