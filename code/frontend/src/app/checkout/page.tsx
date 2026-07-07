"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { rentalService } from "@/services/rental-service";
import { paymentService } from "@/services/payment-service";

// Importing react-aria-components for the DateRangePicker as requested
import { 
  DateRangePicker, 
  Group, 
  DateInput, 
  DateSegment, 
  Popover, 
  Dialog, 
  RangeCalendar, 
  CalendarGrid, 
  CalendarCell, 
  Heading, 
  CalendarHeaderCell, 
  CalendarGridBody, 
  Button as AriaButton 
} from "react-aria-components";
import { today, getLocalTimeZone } from "@internationalized/date";

// Helper to format date into "DD ThM" e.g., "22 Th2"
function formatDisplayDate(dateStr?: string) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${parseInt(day)} Th${parseInt(month)}`;
}

// Icon Components
const CopyIcon = () => (
  <svg className="w-4 h-4 text-zinc-400 hover:text-zinc-650 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5 text-yellow-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

function CheckoutContent() {
  const items: any[] = [];
  const itemCount = 0;
  const totalPrice = 0;
  const clearCart = () => {};
  const updateDates = (productId: number, start: string, end: string, days: number) => {};
  const { user, isLoading, isAuthenticated } = useAuth();
  const { triggerToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Query parameter flow
  const requestIdParam = searchParams ? searchParams.get("requestId") : null;

  // Step state (Step 1 = Review/Submit, Step 2 = QR Payment, Step 3 = Confirm Manual)
  const [step, setStep] = useState(1);

  // Flow State
  const [paymentRequest, setPaymentRequest] = useState<any | null>(null);
  const [rentalPaymentInfo, setRentalPaymentInfo] = useState<any | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(false);

  // Address tab state
  const [addressTab, setAddressTab] = useState<"saved" | "new">("saved");
  const [newAddressInfo, setNewAddressInfo] = useState({
    fullName: "",
    address: "",
    phone: "",
  });

  // Payment method state
  const [paymentTab, setPaymentTab] = useState<"bank" | "card">("bank");

  // VietQR state
  const [orderCode, setOrderCode] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [qrDataURL, setQrDataURL] = useState("");
  const [bankInfo, setBankInfo] = useState<{
    bankAccount: string;
    bankOwner: string;
    bankCode: string;
  } | null>(null);

  // Countdown timer (15 minutes = 900 seconds)
  const [timeLeft, setTimeLeft] = useState(900);

  // Verification checkbox
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load request details if paying for an approved request
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;

    if (requestIdParam) {
      const fetchRequestDetails = async () => {
        setLoadingRequest(true);
        try {
          const data = await rentalService.getMyRentalRequestDetail(parseInt(requestIdParam));
          setPaymentRequest(data);
          
          if (data.status !== "APPROVED") {
            triggerToast("Yêu cầu thuê chưa được phê duyệt hoặc đã hết hạn!");
            router.push("/rentals/renter");
            return;
          }

          if (data.rentalStatus === "ACTIVE" || data.rentalStatus === "RETURN_PENDING" || data.rentalStatus === "COMPLETED") {
            setStep(4);
            setLoadingRequest(false);
            return;
          }

          if (data.rentalId) {
            // Fetch owner's bank and dynamic payment details!
            const payInfo = await rentalService.getRentalPaymentInfo(data.rentalId);
            setRentalPaymentInfo(payInfo);
            setOrderCode(payInfo.paymentContent);
            setStep(2); // Jump directly to Payment QR Step
          } else {
            triggerToast("Không tìm thấy thông tin đơn thuê tương ứng!");
            router.push("/rentals/renter");
          }
        } catch (err: any) {
          console.error("Lỗi lấy chi tiết yêu cầu đặt thuê:", err);
          const errMsg = err.response?.data?.message || "Không thể tải thông tin yêu cầu đặt thuê.";
          triggerToast(errMsg);
          router.push("/rentals/renter");
        } finally {
          setLoadingRequest(false);
        }
      };
      fetchRequestDetails();
    }
  }, [requestIdParam, router, triggerToast, isLoading, isAuthenticated]);

  // Redirect if cart is empty on step 1 (only for initial checkout flow)
  useEffect(() => {
    if (!requestIdParam && step === 1 && itemCount === 0) {
      router.replace("/cart");
    }
  }, [itemCount, step, requestIdParam, router]);

  // Handle countdown logic
  useEffect(() => {
    if (step !== 2 || paymentTab !== "bank" || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, paymentTab, timeLeft]);

  // Calculate pricing dynamically based on current flow
  let finalSubtotal = totalPrice;
  let finalDeposit = 0;
  let finalItemsCount = itemCount;

  if (paymentRequest) {
    const start = new Date(paymentRequest.startDate);
    const end = new Date(paymentRequest.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const rentDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Cast as any because the TS definition in frontend doesn't declare requestedPrice yet
    const pricePerDay = Number((paymentRequest as any).requestedPrice || 0);
    finalSubtotal = pricePerDay * rentDays;
    finalDeposit = Number((paymentRequest as any).requestedDeposit || 0);
    finalItemsCount = 1;
  }

  let serviceFee = Math.round(finalSubtotal * 0.1);
  let finalTotal = finalSubtotal + serviceFee;

  if (rentalPaymentInfo) {
    finalTotal = rentalPaymentInfo.totalPrice;
    finalDeposit = rentalPaymentInfo.depositAmount;
    serviceFee = 0;
  }

  const fetchQrCode = async (code: string, customBankInfo?: any) => {
    setQrLoading(true);
    setQrError(false);
    try {
      const body: any = {
        amount: customBankInfo ? customBankInfo.totalPrice : finalTotal,
        content: code,
      };
      if (customBankInfo) {
        body.bankAccount = customBankInfo.bankAccountNumber;
        body.bankCode = customBankInfo.bankCode;
        body.userBankName = customBankInfo.bankAccountHolderName;
      }
      const res = await fetch("/api/vietqr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setQrDataURL(data.qrDataURL);
        setBankInfo(data.bankInfo);
      } else {
        setQrError(true);
        triggerToast("Không thể kết nối cổng thanh toán VietQR");
      }
    } catch (err) {
      console.error(err);
      setQrError(true);
      triggerToast("Lỗi kết nối cổng thanh toán");
    } finally {
      setQrLoading(false);
    }
  };

  // Fetch VietQR image
  useEffect(() => {
    if (step === 2 && paymentTab === "bank" && orderCode) {
      if (rentalPaymentInfo) {
        fetchQrCode(orderCode, rentalPaymentInfo);
      } else {
        fetchQrCode(orderCode);
      }
    }
  }, [step, paymentTab, orderCode, rentalPaymentInfo]);

  const handleRecreateQr = () => {
    setTimeLeft(900);
    const code = paymentRequest ? "RH" + paymentRequest.rentalId : "SHR" + Date.now().toString().slice(-8);
    setOrderCode(code);
    if (rentalPaymentInfo) {
      fetchQrCode(code, rentalPaymentInfo);
    } else {
      fetchQrCode(code);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Đã sao chép ${label}!`);
  };

  // Submit PENDING request from cart (Initial Checkout flow)
  const handleCreateRentalRequest = async () => {
    // 1. Validate all cart items have dates selected
    const missingDates = items.some(item => !item.startDate || !item.endDate);
    if (missingDates) {
      triggerToast("Vui lòng chọn ngày nhận và trả cho toàn bộ món thuê!");
      return;
    }

    // 2. Validate address details
    if (addressTab === "new") {
      if (!newAddressInfo.fullName.trim() || !newAddressInfo.address.trim() || !newAddressInfo.phone.trim()) {
        triggerToast("Vui lòng nhập đầy đủ thông tin giao nhận mới!");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Sequentially send createRentalRequest API calls to avoid race conditions
      for (const item of items) {
        await rentalService.createRentalRequest({
          productId: item.product.id,
          startDate: item.startDate!,
          endDate: item.endDate!,
          message: `Giao hàng tới: ${addressTab === "saved" ? (user?.fullName || "Trịnh Ngọc Khánh") : newAddressInfo.fullName} (${addressTab === "saved" ? (user?.address || "142 Đường Tây 4, Hà Nội") : newAddressInfo.address})`,
        });
      }

      triggerToast("Gửi yêu cầu thuê thành công! Vui lòng chờ chủ đồ duyệt đơn. 🚀");
      clearCart();
      router.push("/rentals/renter");
    } catch (err: any) {
      console.error(err);
      triggerToast(
        err.response?.data?.message || 
        "Đã có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm payment success (Post-Approval Payment flow)
  const handleConfirmPayment = async () => {
    if (!isConfirmed || !paymentRequest) return;
    setIsSubmitting(true);
    try {
      if (paymentRequest.rentalId) {
        await paymentService.recordPayment({
          rentalId: paymentRequest.rentalId,
          paymentType: "RENTAL_FEE",
          amount: finalTotal,
          transactionCode: orderCode,
          paymentMethod: paymentTab === "bank" ? "PAYOS" : "VNPAY",
          status: "SUCCESS"
        });
        
        if (finalDeposit > 0) {
          try {
            await paymentService.recordPayment({
              rentalId: paymentRequest.rentalId,
              paymentType: "DEPOSIT",
              amount: finalDeposit,
              transactionCode: orderCode + "_DEP",
              paymentMethod: paymentTab === "bank" ? "PAYOS" : "VNPAY",
              status: "SUCCESS"
            });
          } catch (e) {
            console.warn("Deposit already recorded or failed", e);
          }
        }

        triggerToast("Thanh toán thành công! 🎉");
        router.push("/rentals/renter");
      } else {
        triggerToast("Không tìm thấy đơn thuê để xác nhận thanh toán!");
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Có lỗi xảy ra khi xác nhận thanh toán.";
      triggerToast(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getActiveAddress = () => {
    if (addressTab === "saved") {
      return {
        name: user?.fullName || "Trịnh Ngọc Khánh",
        address: user?.address || "142 Đường Tây 4, Căn hộ 3B, Hà Nội, Việt Nam",
        phone: user?.phone || "+84 123 456 789"
      };
    }
    return {
      name: newAddressInfo.fullName,
      address: newAddressInfo.address,
      phone: newAddressInfo.phone
    };
  };

  const activeAddress = getActiveAddress();

  if (loadingRequest) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans">
        <Header />
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-zinc-500">Đang tải thông tin đơn thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-16">
      <Header />

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
        
        {/* Breadcrumbs & Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <button 
            onClick={() => {
              if (paymentRequest) {
                router.push("/rentals/renter");
              } else if (step > 1) {
                setStep(step - 1);
              } else {
                router.push("/cart");
              }
            }}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors shadow-xs"
          >
            <BackIcon />
          </button>
          <span className="font-semibold text-zinc-400">|</span>
          <Link href={paymentRequest ? "/rentals/renter" : "/cart"} className="hover:text-zinc-700 transition-colors">
            {paymentRequest ? "Đơn thuê của tôi" : "Giỏ hàng"}
          </Link>
          <span>/</span>
          <span className="font-bold text-zinc-800">Thanh toán</span>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center items-center max-w-[500px] mx-auto mb-10">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step >= 1 ? "bg-violet-600 text-white" : "bg-zinc-200 text-zinc-500"
            }`}>
              {step > 1 ? <CheckIcon /> : "1"}
            </div>
            <span className={`text-[10px] font-black mt-2 tracking-wider uppercase ${
              step >= 1 ? "text-zinc-800 font-bold" : "text-zinc-400"
            }`}>
              {paymentRequest ? "Khởi tạo" : "Xem lại"}
            </span>
          </div>

          <div className={`flex-1 h-[2px] mx-4 transition-colors ${
            step >= 2 ? "bg-violet-600" : "bg-zinc-200"
          }`} />

          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step >= 2 ? "bg-violet-600 text-white" : "bg-zinc-200 text-zinc-500"
            }`}>
              {step > 2 ? <CheckIcon /> : "2"}
            </div>
            <span className={`text-[10px] font-black mt-2 tracking-wider uppercase ${
              step >= 2 ? "text-zinc-800 font-bold" : "text-zinc-400"
            }`}>Thanh toán</span>
          </div>

          <div className={`flex-1 h-[2px] mx-4 transition-colors ${
            step >= 3 ? "bg-violet-600" : "bg-zinc-200"
          }`} />

          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step >= 3 ? "bg-violet-600 text-white" : "bg-zinc-200 text-zinc-500"
            }`}>
              {step > 3 ? <CheckIcon /> : "3"}
            </div>
            <span className={`text-[10px] font-black mt-2 tracking-wider uppercase ${
              step >= 3 ? "text-zinc-800 font-bold" : "text-zinc-400"
            }`}>Xác nhận</span>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1 Content - Only shown during checkout from cart */}
            {step === 1 && !paymentRequest && (
              <>
                {/* Product review card */}
                <div className="bg-white rounded-3xl border border-zinc-150 p-6 shadow-xs">
                  <h2 className="text-sm font-black text-zinc-700 uppercase tracking-wider mb-4">
                    Món thuê · {items.length}
                  </h2>
                  <div className="divide-y divide-zinc-100">
                    {items.map((item) => (
                      <div key={item.product.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-100 shrink-0 overflow-hidden border border-zinc-100">
                          {item.product.primaryImage ? (
                            <img src={item.product.primaryImage} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-extrabold text-zinc-800 truncate">{item.product.name}</h3>
                          
                          {/* Date details / datepicker selection */}
                          <div className="mt-1">
                            {item.startDate && item.endDate ? (
                              <div className="text-xs text-zinc-500 font-bold flex items-center gap-1.5">
                                <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-700">
                                  {formatDisplayDate(item.startDate)} — {formatDisplayDate(item.endDate)}
                                </span>
                                <span className="text-zinc-400">·</span>
                                <span>{item.rentDays} ngày</span>
                              </div>
                            ) : (
                              <div className="mt-1.5">
                                <AriaDateRangePicker 
                                  onChange={(start, end, days) => updateDates(item.product.id, start, end, days)} 
                                />
                              </div>
                            )}
                          </div>

                          {/* Owner name */}
                          {(item.product as any).ownerFullName && (
                            <div className="text-[10px] text-zinc-400 font-semibold mt-2 flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full bg-zinc-200 inline-block" />
                              <span>Chủ sở hữu: {(item.product as any).ownerFullName}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-zinc-750">{(item.product.pricePerDay * item.rentDays).toLocaleString("vi-VN")}đ</p>
                          <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">{item.product.pricePerDay.toLocaleString("vi-VN")}đ/ngày</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery address card */}
                <div className="bg-white rounded-3xl border border-zinc-150 p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h2 className="text-sm font-black text-zinc-700 uppercase tracking-wider">Địa chỉ giao hàng</h2>
                  </div>

                  {/* Tabs address */}
                  <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl mb-4 max-w-[320px]">
                    <button
                      onClick={() => setAddressTab("saved")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        addressTab === "saved" ? "bg-white text-zinc-800 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      Địa chỉ đã lưu
                    </button>
                    <button
                      onClick={() => setAddressTab("new")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        addressTab === "new" ? "bg-white text-zinc-800 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      Địa chỉ mới
                    </button>
                  </div>

                  {addressTab === "saved" ? (
                    <div className="border border-violet-600/30 bg-violet-50/20 rounded-2xl p-4 relative">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black tracking-widest text-violet-600 uppercase">Nhà</span>
                        <span className="bg-violet-100 text-violet-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          MẶC ĐỊNH <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-zinc-800 mb-1">{user?.fullName || "Trịnh Ngọc Khánh"}</p>
                      <p className="text-xs text-zinc-500 font-medium mb-1">{user?.address || "142 Đường Tây 4, Căn hộ 3B, Hà Nội, Việt Nam"}</p>
                      <p className="text-[10px] text-zinc-400 font-bold tracking-wider">{user?.phone || "+84 123 456 789"}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">Họ và tên</label>
                        <input
                          type="text"
                          value={newAddressInfo.fullName}
                          onChange={(e) => setNewAddressInfo({ ...newAddressInfo, fullName: e.target.value })}
                          placeholder="Nhập tên người nhận"
                          className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-violet-600 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">Địa chỉ nhận hàng</label>
                        <input
                          type="text"
                          value={newAddressInfo.address}
                          onChange={(e) => setNewAddressInfo({ ...newAddressInfo, address: e.target.value })}
                          placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                          className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-violet-600 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">Số điện thoại</label>
                        <input
                          type="text"
                          value={newAddressInfo.phone}
                          onChange={(e) => setNewAddressInfo({ ...newAddressInfo, phone: e.target.value })}
                          placeholder="Nhập số điện thoại liên lạc"
                          className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-violet-600 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit request button */}
                <button
                  disabled={isSubmitting}
                  onClick={handleCreateRentalRequest}
                  className={`w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-2xl shadow-md transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-2 ${
                    isSubmitting ? "cursor-wait opacity-80" : "cursor-pointer"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang gửi yêu cầu...</span>
                    </>
                  ) : (
                    "Gửi yêu cầu thuê →"
                  )}
                </button>
              </>
            )}

            {/* Step 2 Content - Payments (VietQR Code) */}
            {step === 2 && (
              <>
                {/* Giao den details */}
                <div className="bg-white rounded-3xl border border-zinc-150 p-6 shadow-xs flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">GIAO ĐẾN</span>
                    {paymentRequest ? (
                      <>
                        <p className="text-xs font-extrabold text-zinc-800">{user?.fullName || "Trịnh Ngọc Khánh"}</p>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          {paymentRequest.message?.replace("Giao hàng tới: ", "").split(" (")[0] || user?.address || "142 Đường Tây 4, Hà Nội, Việt Nam"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-extrabold text-zinc-800">{activeAddress.name} — Nhà</p>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">{activeAddress.address}</p>
                      </>
                    )}
                    <p className="text-[9px] font-extrabold text-violet-600 mt-2 tracking-wider bg-violet-50 px-2 py-0.5 rounded inline-block">
                      🚚 Tiêu chuẩn — 25-27 Th2
                    </p>
                  </div>
                  {!paymentRequest && (
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors"
                    >
                      Thay đổi
                    </button>
                  )}
                </div>

                {/* Phuong thuc thanh toan card */}
                <div className="bg-white rounded-3xl border border-zinc-150 p-6 shadow-xs">
                  <h2 className="text-sm font-black text-zinc-700 uppercase tracking-wider mb-4">Phương thức thanh toán</h2>
                  
                  {/* Payment Tabs */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl mb-6">
                    <button
                      onClick={() => setPaymentTab("card")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        paymentTab === "card" ? "bg-white text-zinc-800 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      Thẻ ngân hàng
                    </button>
                    <button
                      onClick={() => setPaymentTab("bank")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        paymentTab === "bank" ? "bg-violet-600 text-white shadow-xs" : "text-zinc-500 hover:text-zinc-850"
                      }`}
                    >
                      Chuyển khoản
                    </button>
                  </div>

                  {paymentTab === "card" ? (
                    <div className="py-8 text-center bg-zinc-50 border border-zinc-200 border-dashed rounded-2xl text-xs font-semibold text-zinc-400">
                      💳 Tính năng đang phát triển
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-4 bg-zinc-50/50 rounded-2xl border border-zinc-100 p-6">
                      <p className="text-xs font-extrabold text-zinc-700 mb-1">Quét mã QR để thanh toán</p>
                      
                      {/* Countdown Timer */}
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold mb-6">
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Thời gian còn lại:</span>
                        <span className="text-violet-600 text-sm font-black">{formatTime(timeLeft)}</span>
                      </div>

                      {/* QR Display / Loading skeleton */}
                      <div className="w-[180px] h-[180px] bg-white border border-zinc-200 rounded-2xl flex items-center justify-center p-2 shadow-sm relative overflow-hidden">
                        {qrLoading ? (
                          <div className="w-full h-full bg-zinc-100 animate-pulse rounded-xl" />
                        ) : qrError ? (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <span className="text-red-500 font-bold text-xs">Lỗi tải mã QR</span>
                            <button 
                              onClick={() => fetchQrCode(orderCode)} 
                              className="mt-2 text-[10px] font-black text-violet-600 bg-violet-50 px-2.5 py-1 rounded"
                            >
                              Tải lại
                            </button>
                          </div>
                        ) : timeLeft <= 0 ? (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <span className="text-zinc-400 font-bold text-xs mb-2">Mã QR hết hạn</span>
                            <button 
                              onClick={handleRecreateQr} 
                              className="text-[10px] font-black text-white bg-violet-600 px-3 py-1.5 rounded-lg shadow-sm"
                            >
                              Tạo lại mã QR
                            </button>
                          </div>
                        ) : qrDataURL ? (
                          <img 
                            src={qrDataURL} 
                            alt="VietQR Payment Code" 
                            className="w-full h-full object-contain transition-opacity duration-550 opacity-100" 
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-150 animate-pulse rounded-xl" />
                        )}
                      </div>

                      <p className="text-[10px] text-zinc-455 font-bold text-center mt-5 leading-relaxed max-w-[280px]">
                        Mở ứng dụng ngân hàng bất kỳ trên điện thoại và quét mã QR ở trên để hoàn tất thanh toán.
                      </p>
                    </div>
                  )}
                </div>

                {/* Step 2 buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (paymentRequest) {
                        router.push("/rentals/renter");
                      } else {
                        setStep(1);
                      }
                    }}
                    className="flex-1 py-3.5 border border-zinc-200 hover:bg-zinc-100 bg-white text-zinc-700 font-extrabold rounded-2xl shadow-xs transition-all text-xs tracking-wider uppercase"
                  >
                    ← Quay lại
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={timeLeft <= 0 || qrLoading}
                    className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl shadow-md transition-all text-xs tracking-wider uppercase"
                  >
                    Tiếp theo →
                  </button>
                </div>
              </>
            )}

            {/* Step 3 Content - Manual Bank details */}
            {step === 3 && (
              <>
                <div className="bg-white rounded-3xl border border-zinc-150 p-6 shadow-xs text-center space-y-4">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">SỐ TIỀN CẦN CHUYỂN</span>
                  <p className="text-3xl font-black text-violet-700">{finalTotal.toLocaleString("vi-VN")}đ</p>
                  <p className="text-xs text-zinc-400 font-bold">hoặc chuyển khoản thủ công</p>
                  
                  {/* Manual details table */}
                  <div className="border border-zinc-100 rounded-2xl overflow-hidden mt-4 text-left">
                    <div className="grid grid-cols-12 border-b border-zinc-100 py-3.5 px-4 items-center">
                      <div className="col-span-4 text-[9px] font-black text-zinc-450 uppercase tracking-wider">NGÂN HÀNG</div>
                      <div className="col-span-8 flex justify-between items-center pl-2">
                        <span className="text-xs font-extrabold text-zinc-700">
                          {process.env.NEXT_PUBLIC_BANK_NAME_DISPLAY || "Vietcombank"}
                        </span>
                        <button onClick={() => handleCopy(process.env.NEXT_PUBLIC_BANK_NAME_DISPLAY || "Vietcombank", "Ngân hàng")}>
                          <CopyIcon />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 border-b border-zinc-100 py-3.5 px-4 items-center">
                      <div className="col-span-4 text-[9px] font-black text-zinc-455 uppercase tracking-wider">CHỦ TÀI KHOẢN</div>
                      <div className="col-span-8 flex justify-between items-center pl-2">
                        <span className="text-xs font-extrabold text-zinc-700 uppercase">
                          {bankInfo?.bankOwner || "CONG TY CP SHARIO"}
                        </span>
                        <button onClick={() => handleCopy(bankInfo?.bankOwner || "CONG TY CP SHARIO", "Chủ tài khoản")}>
                          <CopyIcon />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 border-b border-zinc-100 py-3.5 px-4 items-center">
                      <div className="col-span-4 text-[9px] font-black text-zinc-455 uppercase tracking-wider">SỐ TÀI KHOẢN</div>
                      <div className="col-span-8 flex justify-between items-center pl-2">
                        <span className="text-xs font-black text-zinc-800 tracking-wider">
                          {bankInfo?.bankAccount || "1234 5678 9012"}
                        </span>
                        <button onClick={() => handleCopy(bankInfo?.bankAccount || "123456789012", "Số tài khoản")}>
                          <CopyIcon />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 border-b border-zinc-100 py-3.5 px-4 items-center">
                      <div className="col-span-4 text-[9px] font-black text-zinc-455 uppercase tracking-wider">SỐ TIỀN</div>
                      <div className="col-span-8 flex justify-between items-center pl-2">
                        <span className="text-xs font-black text-zinc-800">
                          {finalTotal.toLocaleString("vi-VN")}đ
                        </span>
                        <button onClick={() => handleCopy(finalTotal.toString(), "Số tiền")}>
                          <CopyIcon />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 py-3.5 px-4 items-center">
                      <div className="col-span-4 text-[9px] font-black text-zinc-455 uppercase tracking-wider">NỘI DUNG CHUYỂN KHOẢN</div>
                      <div className="col-span-8 flex justify-between items-center pl-2">
                        <span className="text-xs font-black text-violet-755 font-mono select-all">
                          {orderCode}
                        </span>
                        <button onClick={() => handleCopy(orderCode, "Nội dung chuyển khoản")}>
                          <CopyIcon />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Warning alert */}
                  <div className="bg-yellow-50/50 border border-yellow-200/50 rounded-2xl p-4 flex gap-3 text-left">
                    <AlertIcon />
                    <div>
                      <p className="text-xs font-extrabold text-yellow-800">Lưu ý quan trọng</p>
                      <p className="text-[10px] text-yellow-700 font-semibold mt-0.5 leading-relaxed">
                        Vui lòng chuyển <span className="font-extrabold text-yellow-800">đúng số tiền</span> và ghi <span className="font-extrabold text-yellow-800">đúng nội dung chuyển khoản</span> như trên để hệ thống ghi nhận chính xác tự động.
                      </p>
                    </div>
                  </div>

                  {/* Confirmation Checkbox */}
                  <label className="flex gap-2 items-start text-left pt-4 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isConfirmed}
                      onChange={(e) => setIsConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-violet-600 border-zinc-300 rounded focus:ring-violet-500"
                    />
                    <span className="text-[10.5px] text-zinc-500 font-bold leading-normal">
                      Tôi đã chuyển khoản thành công với đúng số tiền và nội dung chuyển khoản như trên
                    </span>
                  </label>
                </div>

                {/* Security verification badge */}
                <div className="bg-zinc-100 border border-zinc-200/50 rounded-2xl p-3.5 flex items-center justify-center gap-1.5 text-zinc-500">
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-[9.5px] font-bold">Bảo mật bởi Shario Protect — Mã hóa 256-bit. Bảo hiểm toàn bộ. Hoàn tiền ngay lập tức.</span>
                </div>

                {/* Step 3 buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="py-3.5 px-6 border border-zinc-200 hover:bg-zinc-100 bg-white text-zinc-700 font-extrabold rounded-2xl shadow-xs transition-all text-xs tracking-wider uppercase"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={!isConfirmed || isSubmitting}
                    className={`flex-1 py-3.5 rounded-2xl text-xs font-black tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
                      !isConfirmed || isSubmitting
                        ? "bg-zinc-300 text-zinc-400 cursor-not-allowed"
                        : "bg-violet-600 hover:bg-violet-700 text-white cursor-pointer hover:shadow-lg active:scale-[0.99]"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      "✓ Tôi đã chuyển khoản"
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Step 4 Content - Payment Successful Confirmation */}
            {step === 4 && (
              <div className="bg-white rounded-3xl border border-zinc-150 p-8 shadow-xs text-center space-y-6 flex flex-col items-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 border border-green-200">
                  <svg className="w-8 h-8 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-zinc-900">Thanh toán thành công!</h2>
                  <p className="text-sm text-zinc-550 max-w-md mx-auto">
                    Đơn đặt thuê của bạn đã được kích hoạt thành công. Chủ đồ đã nhận được thông tin thanh toán của bạn.
                  </p>
                </div>

                <div className="border border-zinc-100 rounded-2xl p-4 w-full text-left space-y-3 bg-zinc-50/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 font-bold">Mã đơn thuê:</span>
                    <span className="text-zinc-700 font-black">RH{paymentRequest?.rentalId}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 font-bold">Sản phẩm:</span>
                    <span className="text-zinc-700 font-extrabold truncate max-w-[200px]">{paymentRequest?.productName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 font-bold">Số tiền đã trả:</span>
                    <span className="text-violet-700 font-black">{finalTotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 font-bold">Trạng thái:</span>
                    <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-200 rounded-full">
                      Đã thanh toán
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/rentals/renter")}
                  className="w-full py-3.5 bg-violet-600 hover:bg-violet-750 text-white rounded-2xl text-xs font-black tracking-wider uppercase shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer"
                >
                  Quay lại đơn thuê của tôi
                </button>
              </div>
            )}
          </div>

          {/* Right Column (Order Summary - Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl border border-zinc-150 p-6 shadow-xs space-y-5">
              <h2 className="text-sm font-black text-zinc-800 uppercase tracking-wider">Tóm tắt đơn hàng</h2>
              
              {/* Cart List */}
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                {paymentRequest ? (
                  // Summary for existing Request Payment flow
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-zinc-100 rounded-xl overflow-hidden shrink-0 border border-zinc-100">
                      <span className="w-full h-full flex items-center justify-center text-lg">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-zinc-800 truncate leading-snug">
                        {paymentRequest.productName}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                        {formatDisplayDate(paymentRequest.startDate)} — {formatDisplayDate(paymentRequest.endDate)} · {
                          Math.ceil(Math.abs(new Date(paymentRequest.endDate).getTime() - new Date(paymentRequest.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
                        } ngày
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-zinc-700">
                        {finalSubtotal.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                ) : (
                  // Summary for Cart checkout flow
                  items.map((item) => (
                    <div key={item.product.id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 bg-zinc-100 rounded-xl overflow-hidden shrink-0 border border-zinc-100">
                        {item.product.primaryImage ? (
                          <img src={item.product.primaryImage} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-extrabold text-zinc-800 truncate leading-snug">{item.product.name}</h4>
                        <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                          {item.startDate && item.endDate ? (
                            `${formatDisplayDate(item.startDate)} — ${formatDisplayDate(item.endDate)} · ${item.rentDays} ngày`
                          ) : (
                            "Chờ chọn ngày"
                          )}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-zinc-700">
                          {(item.product.pricePerDay * item.rentDays).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-zinc-100 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between font-semibold text-zinc-550">
                  <span>Tạm tính</span>
                  <span className="text-zinc-800 font-bold">{finalSubtotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between font-semibold text-zinc-550">
                  <span>Phí dịch vụ</span>
                  <span className="text-zinc-800 font-bold">{serviceFee.toLocaleString("vi-VN")}đ</span>
                </div>
                {finalDeposit > 0 && (
                  <div className="flex justify-between font-semibold text-zinc-550">
                    <span>Tiền đặt cọc (Sẽ hoàn lại)</span>
                    <span className="text-zinc-800 font-bold">{finalDeposit.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-zinc-550">
                  <span>Vận chuyển (Tiêu chuẩn)</span>
                  <span className="text-green-600 font-bold">Miễn phí</span>
                </div>

                <div className="border-t border-zinc-100 pt-4 flex justify-between items-baseline">
                  <span className="text-xs font-black text-zinc-800 uppercase tracking-wider">Tổng cộng</span>
                  <span className="text-xl font-black text-zinc-900">{finalTotal.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              {/* Shario protect badge */}
              <div className="bg-violet-50/50 border border-violet-100/50 rounded-2xl p-3 flex items-center gap-2 text-violet-700 text-[10px] font-bold justify-center select-none">
                <span>🛡 Bảo vệ bởi Shario Protect</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Custom AriaDateRangePicker Component
function AriaDateRangePicker({ onChange }: { onChange: (start: string, end: string, days: number) => void }) {
  const t = today(getLocalTimeZone());
  
  return (
    <div className="react-aria-DateRangePicker">
      <DateRangePicker 
        aria-label="Chọn ngày thuê"
        minValue={t}
        onChange={(value) => {
          if (value && value.start && value.end) {
            const startStr = value.start.toString();
            const endStr = value.end.toString();
            
            const d1 = new Date(startStr);
            const d2 = new Date(endStr);
            const diffTime = Math.abs(d2.getTime() - d1.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            onChange(startStr, endStr, diffDays);
          }
        }}
      >
        <Group className="flex items-center gap-1 bg-white border border-zinc-200 rounded-xl p-1.5 focus-within:border-violet-600 transition-colors text-xs font-semibold max-w-[240px]">
          <DateInput slot="start" className="flex">
            {(segment) => (
              <DateSegment
                segment={segment}
                className="px-0.5 rounded focus:bg-violet-100 focus:text-violet-900 outline-none select-none"
              />
            )}
          </DateInput>
          <span aria-hidden="true" className="text-zinc-400 px-1">—</span>
          <DateInput slot="end" className="flex">
            {(segment) => (
              <DateSegment
                segment={segment}
                className="px-0.5 rounded focus:bg-violet-100 focus:text-violet-900 outline-none select-none"
              />
            )}
          </DateInput>
        </Group>
        <Popover className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xl z-50">
          <Dialog>
            <RangeCalendar className="w-full">
              <header className="flex justify-between items-center mb-3">
                <AriaButton slot="previous" className="p-1 hover:bg-zinc-100 rounded text-zinc-500 font-bold text-xs select-none">◀</AriaButton>
                <Heading className="text-xs font-bold text-zinc-700" />
                <AriaButton slot="next" className="p-1 hover:bg-zinc-100 rounded text-zinc-500 font-bold text-xs select-none">▶</AriaButton>
              </header>
              <CalendarGrid className="w-full text-center border-collapse">
                <CalendarHeaderCell className="text-[10px] font-bold text-zinc-400 py-1" />
                <CalendarGridBody>
                  {(date) => (
                    <CalendarCell
                      date={date}
                      className={({ isSelected, isSelectionStart, isSelectionEnd, isDisabled }) => `
                        h-7 w-7 text-xs font-bold rounded-full transition-all relative flex items-center justify-center select-none cursor-pointer mx-auto
                        ${isDisabled ? 'text-zinc-300 cursor-not-allowed opacity-50' : ''}
                        ${isSelected ? 'bg-violet-50 text-violet-700' : 'text-zinc-750 hover:bg-zinc-100'}
                        ${(isSelectionStart || isSelectionEnd) ? 'bg-violet-600 text-white rounded-full' : ''}
                      `}
                    />
                  )}
                </CalendarGridBody>
              </CalendarGrid>
            </RangeCalendar>
          </Dialog>
        </Popover>
      </DateRangePicker>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-secondary">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </ProtectedRoute>
  );
}
