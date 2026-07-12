"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

import { getPrimaryImage } from "@/utils/image-utils";
import { rentalService } from "@/services/rental-service";
import { paymentService } from "@/services/payment-service";

import { Copy, Check, AlertTriangle, ArrowLeft, Loader2, Package, ShieldCheck, ChevronLeft, ChevronRight, CreditCard, Landmark } from "lucide-react";

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
          if (err.response?.status === 401 || err.response?.status === 403) return;
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
    if (step !== 2 || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  // Poll rental request status when waiting for payment on Step 2
  useEffect(() => {
    if (step !== 2 || !requestIdParam) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const data = await rentalService.getMyRentalRequestDetail(parseInt(requestIdParam));
        if (isSubscribed) {
          if (data.rentalStatus === "ACTIVE" || data.rentalStatus === "RETURN_PENDING" || data.rentalStatus === "COMPLETED") {
            setPaymentRequest(data);
            setStep(4); // Transition to Success Bill
            triggerToast("Thanh toán thành công qua SePay! 🎉");
          }
        }
      } catch (error) {
        console.error("Lỗi tự động kiểm tra thanh toán:", error);
      }
    }, 3000); // Check every 3 seconds

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [step, requestIdParam, triggerToast]);

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
    if (step === 2 && orderCode) {
      if (rentalPaymentInfo) {
        fetchQrCode(orderCode, rentalPaymentInfo);
      } else {
        fetchQrCode(orderCode);
      }
    }
  }, [step, orderCode, rentalPaymentInfo]);

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
            amount: finalTotal - finalDeposit,
            transactionCode: orderCode,
            paymentMethod: "VIETQR",
            status: "SUCCESS"
          });
        
        if (finalDeposit > 0) {
          try {
            await paymentService.recordPayment({
              rentalId: paymentRequest.rentalId,
              paymentType: "DEPOSIT",
              amount: finalDeposit,
              transactionCode: orderCode + "_DEP",
              paymentMethod: "VIETQR",
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

  // Demo bypass confirmation method - ghi nhận thanh toán thủ công và nhảy qua bước hóa đơn
  const handleDemoBypass = async () => {
    if (!paymentRequest?.rentalId) {
      triggerToast("Không tìm thấy đơn thuê để thanh toán!");
      return;
    }
    setIsSubmitting(true);
    try {
      // Ghi nhận phí thuê
      await paymentService.recordPayment({
        rentalId: paymentRequest.rentalId,
        paymentType: "RENTAL_FEE",
        amount: finalTotal,
        transactionCode: orderCode + "_MANUAL",
        paymentMethod: "PAYOS",
        status: "SUCCESS"
      });

      // Ghi nhận tiền cọc nếu có
      if (finalDeposit > 0) {
        try {
          await paymentService.recordPayment({
            rentalId: paymentRequest.rentalId,
            paymentType: "DEPOSIT",
            amount: finalDeposit,
            transactionCode: orderCode + "_DEP_MANUAL",
            paymentMethod: "PAYOS",
            status: "SUCCESS"
          });
        } catch (e) {
          console.warn("Deposit already recorded or failed", e);
        }
      }

      triggerToast("Thanh toán thành công! 🎉");
      setStep(4); // Nhảy thẳng sang màn hình hóa đơn
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Lỗi xác nhận thanh toán.";
      triggerToast(msg);
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
      <div className="min-h-screen bg-primary font-sans flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
          <p className="text-sm font-semibold text-secondary">Đang tải thông tin đơn thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary font-sans pb-16 flex flex-col">
      <Header />

      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-6 py-8">
        
        {/* Breadcrumbs & Navigation */}
        <div className="flex items-center gap-2 text-sm text-secondary mb-8">
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
            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary border border-secondary hover:bg-tertiary transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-tertiary">/</span>
          <Link href={paymentRequest ? "/rentals/renter" : "/cart"} className="hover:text-primary transition-colors">
            {paymentRequest ? "Đơn thuê của tôi" : "Giỏ hàng"}
          </Link>
          <span className="font-semibold text-tertiary">/</span>
          <span className="font-bold text-primary">Thanh toán</span>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center items-center max-w-2xl mx-auto mb-12">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm ${
              step >= 1 ? "bg-brand-600 text-white" : "bg-primary border border-secondary text-secondary"
            }`}>
              {step > 1 ? <Check className="w-5 h-5" /> : "1"}
            </div>
            <span className={`text-xs font-semibold mt-3 uppercase tracking-wide ${
              step >= 1 ? "text-primary" : "text-secondary"
            }`}>
              {paymentRequest ? "Khởi tạo" : "Xem lại"}
            </span>
          </div>

          <div className={`flex-1 h-1 mx-4 rounded-full transition-colors ${
            step >= 2 ? "bg-brand-600" : "bg-primary border-t border-b border-secondary"
          }`} />

          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm ${
              step >= 2 ? "bg-brand-600 text-white" : "bg-primary border border-secondary text-secondary"
            }`}>
              {step > 2 ? <Check className="w-5 h-5" /> : "2"}
            </div>
            <span className={`text-xs font-semibold mt-3 uppercase tracking-wide ${
              step >= 2 ? "text-primary" : "text-secondary"
            }`}>Thanh toán</span>
          </div>

          <div className={`flex-1 h-1 mx-4 rounded-full transition-colors ${
            step >= 3 ? "bg-brand-600" : "bg-primary border-t border-b border-secondary"
          }`} />

          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm ${
              step >= 3 ? "bg-brand-600 text-white" : "bg-primary border border-secondary text-secondary"
            }`}>
              {step > 3 ? <Check className="w-5 h-5" /> : "3"}
            </div>
            <span className={`text-xs font-semibold mt-3 uppercase tracking-wide ${
              step >= 3 ? "text-primary" : "text-secondary"
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
                <div className="bg-primary rounded-2xl border border-secondary p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 border-b border-secondary pb-4">
                    <Package className="w-5 h-5 text-brand-600" />
                    <h2 className="text-base font-semibold text-primary uppercase tracking-wide">
                      Món thuê · {items.length}
                    </h2>
                  </div>
                  <div className="divide-y divide-secondary">
                    {items.map((item) => (
                      <div key={item.product.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                        <div className="w-20 h-20 rounded-xl bg-secondary shrink-0 overflow-hidden border border-secondary flex items-center justify-center">
                          {getPrimaryImage(item.product) ? (
                            <img src={getPrimaryImage(item.product)} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-tertiary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-primary truncate">{item.product.name}</h3>
                            {/* Owner name */}
                            {(item.product as any).ownerFullName && (
                              <div className="text-xs text-secondary mt-1">
                                Chủ sở hữu: <span className="font-medium text-primary">{(item.product as any).ownerFullName}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Date details / datepicker selection */}
                          <div className="mt-2">
                            {item.startDate && item.endDate ? (
                              <div className="text-xs font-medium flex items-center gap-2">
                                <span className="bg-secondary px-2.5 py-1 rounded-lg text-primary">
                                  {formatDisplayDate(item.startDate)} — {formatDisplayDate(item.endDate)}
                                </span>
                                <span className="text-secondary">•</span>
                                <span className="text-primary font-semibold">{item.rentDays} ngày</span>
                              </div>
                            ) : (
                              <div className="mt-1">
                                <AriaDateRangePicker 
                                  onChange={(start, end, days) => updateDates(item.product.id, start, end, days)} 
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex flex-col justify-between">
                          <p className="text-sm font-bold text-brand-600">{(item.product.pricePerDay * item.rentDays).toLocaleString("vi-VN")}đ</p>
                          <p className="text-xs text-secondary font-medium">{item.product.pricePerDay.toLocaleString("vi-VN")}đ/ngày</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery address card */}
                <div className="bg-primary rounded-2xl border border-secondary p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 border-b border-secondary pb-4">
                    <Package className="w-5 h-5 text-brand-600" />
                    <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Địa chỉ giao hàng</h2>
                  </div>

                  {/* Tabs address */}
                  <div className="flex gap-2 p-1 bg-secondary rounded-xl mb-6 max-w-sm">
                    <button
                      onClick={() => setAddressTab("saved")}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                        addressTab === "saved" ? "bg-primary text-primary shadow-sm" : "text-secondary hover:text-primary"
                      }`}
                    >
                      Địa chỉ đã lưu
                    </button>
                    <button
                      onClick={() => setAddressTab("new")}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                        addressTab === "new" ? "bg-primary text-primary shadow-sm" : "text-secondary hover:text-primary"
                      }`}
                    >
                      Địa chỉ mới
                    </button>
                  </div>

                  {addressTab === "saved" ? (
                    <div className="border border-brand-200 dark:border-brand-900 bg-brand-50 dark:bg-brand-950/20 rounded-xl p-5 relative">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold tracking-widest text-brand-600 uppercase">Nhà</span>
                        <span className="bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          MẶC ĐỊNH <Check className="w-3 h-3" />
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-primary mb-1">{user?.fullName || "Trịnh Ngọc Khánh"}</p>
                      <p className="text-sm text-secondary mb-2">{user?.address || "142 Đường Tây 4, Căn hộ 3B, Hà Nội, Việt Nam"}</p>
                      <p className="text-xs font-medium text-secondary">{user?.phone || "+84 123 456 789"}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">Họ và tên</label>
                        <input
                          type="text"
                          value={newAddressInfo.fullName}
                          onChange={(e) => setNewAddressInfo({ ...newAddressInfo, fullName: e.target.value })}
                          placeholder="Nhập tên người nhận"
                          className="w-full px-4 py-2.5 bg-primary border border-secondary rounded-xl text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">Địa chỉ nhận hàng</label>
                        <input
                          type="text"
                          value={newAddressInfo.address}
                          onChange={(e) => setNewAddressInfo({ ...newAddressInfo, address: e.target.value })}
                          placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                          className="w-full px-4 py-2.5 bg-primary border border-secondary rounded-xl text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">Số điện thoại</label>
                        <input
                          type="text"
                          value={newAddressInfo.phone}
                          onChange={(e) => setNewAddressInfo({ ...newAddressInfo, phone: e.target.value })}
                          placeholder="Nhập số điện thoại liên lạc"
                          className="w-full px-4 py-2.5 bg-primary border border-secondary rounded-xl text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit request button */}
                <button
                  disabled={isSubmitting}
                  onClick={handleCreateRentalRequest}
                  className={`w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-sm transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2 ${
                    isSubmitting ? "opacity-80 cursor-wait" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang gửi yêu cầu...</span>
                    </>
                  ) : (
                    "Gửi yêu cầu thuê"
                  )}
                </button>
              </>
            )}

            {/* Step 2 Content - Payments (VietQR Code) */}
            {step === 2 && (
              <>
                {/* Giao den details */}
                <div className="bg-primary rounded-2xl border border-secondary p-6 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <span className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-2">Giao đến</span>
                    {paymentRequest ? (
                      <>
                        <p className="text-sm font-semibold text-primary">{user?.fullName || "Trịnh Ngọc Khánh"}</p>
                        <p className="text-sm text-secondary mt-1">
                          {paymentRequest.message?.replace("Giao hàng tới: ", "").split(" (")[0] || user?.address || "142 Đường Tây 4, Hà Nội, Việt Nam"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-primary">{activeAddress.name} — Nhà</p>
                        <p className="text-sm text-secondary mt-1">{activeAddress.address}</p>
                      </>
                    )}
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-semibold">
                      <Package className="w-3.5 h-3.5" />
                      Tiêu chuẩn — 25-27 Th2
                    </div>
                  </div>
                  {!paymentRequest && (
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      Thay đổi
                    </button>
                  )}
                </div>

                {/* Phuong thuc thanh toan card */}
                <div className="bg-primary rounded-2xl border border-secondary p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 border-b border-secondary pb-4">
                    <CreditCard className="w-5 h-5 text-brand-600" />
                    <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Phương thức thanh toán</h2>
                  </div>

                  <div className="flex flex-col items-center py-8 bg-secondary/50 rounded-xl border border-secondary px-6">
                    <p className="text-sm font-semibold text-primary mb-2">Quét mã QR để thanh toán</p>
                      
                      {/* Countdown Timer */}
                      <div className="flex items-center gap-2 text-sm font-medium mb-6 bg-primary px-4 py-2 rounded-lg border border-secondary shadow-sm">
                        <span className="text-secondary">Thời gian còn lại:</span>
                        <span className="text-brand-600 font-bold">{formatTime(timeLeft)}</span>
                      </div>

                      {/* QR Display / Loading skeleton */}
                      <div className="w-56 h-56 bg-primary border border-secondary rounded-xl flex items-center justify-center p-3 shadow-sm relative overflow-hidden">
                        {qrLoading ? (
                          <div className="w-full h-full bg-secondary animate-pulse rounded-lg" />
                        ) : qrError ? (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <span className="text-red-500 font-semibold text-sm">Lỗi tải mã QR</span>
                            <button 
                              onClick={() => fetchQrCode(orderCode)} 
                              className="mt-3 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg transition-colors"
                            >
                              Tải lại
                            </button>
                          </div>
                        ) : timeLeft <= 0 ? (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <span className="text-secondary font-semibold text-sm mb-3">Mã QR hết hạn</span>
                            <button 
                              onClick={handleRecreateQr} 
                              className="text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg transition-colors"
                            >
                              Tạo lại mã QR
                            </button>
                          </div>
                        ) : qrDataURL ? (
                          <img 
                            src={qrDataURL} 
                            alt="VietQR Payment Code" 
                            className="w-full h-full object-contain rounded-lg" 
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary animate-pulse rounded-lg" />
                        )}
                      </div>

                      <p className="text-xs text-secondary font-medium text-center mt-6 max-w-xs leading-relaxed">
                        Mở ứng dụng ngân hàng bất kỳ trên điện thoại và quét mã QR ở trên để hoàn tất thanh toán.
                      </p>
                    </div>
                </div>

                {/* Step 2 buttons */}
                <div className="w-full space-y-3">
                  <button
                    onClick={handleDemoBypass}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-violet-650 hover:bg-violet-750 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-md transition-all text-xs tracking-wider uppercase text-center"
                  >
                    {isSubmitting ? "Đang xử lý..." : "Xác nhận đã chuyển tiền"}
                  </button>
                  <button
                    onClick={() => {
                      if (paymentRequest) {
                        router.push("/rentals/renter");
                      } else {
                        setStep(1);
                      }
                    }}
                    className="flex-1 py-4 bg-primary border border-secondary hover:bg-tertiary text-primary font-semibold rounded-xl transition-colors text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={timeLeft <= 0 || qrLoading}
                    className="flex-1 py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-secondary disabled:text-tertiary disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm uppercase tracking-wide shadow-sm"
                  >
                    Tiếp theo
                  </button>
                </div>
              </>
            )}

            {/* Step 3 Content - Manual Bank details */}
            {step === 3 && (
              <>
                <div className="bg-primary rounded-2xl border border-secondary p-8 shadow-sm text-center">
                  <span className="text-xs font-semibold text-secondary uppercase tracking-widest block mb-3">Số tiền cần chuyển</span>
                  <p className="text-4xl font-bold text-brand-600 mb-2">{finalTotal.toLocaleString("vi-VN")}đ</p>
                  <p className="text-sm text-secondary">Hoặc chuyển khoản thủ công theo thông tin bên dưới</p>
                  
                  {/* Manual details table */}
                  <div className="border border-secondary rounded-xl overflow-hidden mt-8 text-left divide-y divide-secondary">
                    <div className="grid grid-cols-12 py-4 px-5 items-center hover:bg-tertiary transition-colors">
                      <div className="col-span-4 text-xs font-semibold text-secondary uppercase tracking-wide">Ngân hàng</div>
                      <div className="col-span-8 flex justify-between items-center">
                        <span className="text-sm font-semibold text-primary">
                          {process.env.NEXT_PUBLIC_BANK_NAME_DISPLAY || "Vietcombank"}
                        </span>
                        <button onClick={() => handleCopy(process.env.NEXT_PUBLIC_BANK_NAME_DISPLAY || "Vietcombank", "Ngân hàng")} className="p-1 text-secondary hover:text-brand-600 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 py-4 px-5 items-center hover:bg-tertiary transition-colors">
                      <div className="col-span-4 text-xs font-semibold text-secondary uppercase tracking-wide">Chủ tài khoản</div>
                      <div className="col-span-8 flex justify-between items-center">
                        <span className="text-sm font-semibold text-primary uppercase">
                          {bankInfo?.bankOwner || "CONG TY CP SHARIO"}
                        </span>
                        <button onClick={() => handleCopy(bankInfo?.bankOwner || "CONG TY CP SHARIO", "Chủ tài khoản")} className="p-1 text-secondary hover:text-brand-600 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 py-4 px-5 items-center hover:bg-tertiary transition-colors">
                      <div className="col-span-4 text-xs font-semibold text-secondary uppercase tracking-wide">Số tài khoản</div>
                      <div className="col-span-8 flex justify-between items-center">
                        <span className="text-sm font-bold text-primary tracking-wider">
                          {bankInfo?.bankAccount || "1234 5678 9012"}
                        </span>
                        <button onClick={() => handleCopy(bankInfo?.bankAccount || "123456789012", "Số tài khoản")} className="p-1 text-secondary hover:text-brand-600 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 py-4 px-5 items-center hover:bg-tertiary transition-colors">
                      <div className="col-span-4 text-xs font-semibold text-secondary uppercase tracking-wide">Nội dung</div>
                      <div className="col-span-8 flex justify-between items-center">
                        <span className="text-sm font-bold text-brand-600 font-mono select-all">
                          {orderCode}
                        </span>
                        <button onClick={() => handleCopy(orderCode, "Nội dung chuyển khoản")} className="p-1 text-secondary hover:text-brand-600 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Warning alert */}
                  <div className="mt-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 flex gap-3 text-left">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-500">Lưu ý quan trọng</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                        Vui lòng chuyển <span className="font-bold">đúng số tiền</span> và ghi <span className="font-bold">đúng nội dung chuyển khoản</span> như trên để hệ thống tự động ghi nhận chính xác.
                      </p>
                    </div>
                  </div>

                  {/* Confirmation Checkbox */}
                  <label className="flex items-start gap-3 mt-6 text-left cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        checked={isConfirmed}
                        onChange={(e) => setIsConfirmed(e.target.checked)}
                        className="peer appearance-none w-5 h-5 border-2 border-secondary rounded-md checked:bg-brand-600 checked:border-brand-600 transition-colors cursor-pointer"
                      />
                      <Check className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                    </div>
                    <span className="text-sm text-primary font-medium group-hover:text-brand-600 transition-colors">
                      Tôi xác nhận đã chuyển khoản thành công với đúng số tiền và nội dung chuyển khoản như trên
                    </span>
                  </label>
                </div>

                {/* Security verification badge */}
                <div className="bg-secondary/50 border border-secondary rounded-xl p-4 flex items-center justify-center gap-2 text-secondary">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs font-semibold">Bảo mật bởi Shario Protect — Mã hóa 256-bit. Bảo hiểm toàn diện.</span>
                </div>

                {/* Step 3 buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 bg-primary border border-secondary hover:bg-tertiary text-primary font-semibold rounded-xl transition-colors text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={!isConfirmed || isSubmitting}
                    className={`flex-[2] py-4 rounded-xl text-sm font-semibold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
                      !isConfirmed || isSubmitting
                        ? "bg-secondary text-tertiary cursor-not-allowed"
                        : "bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Tôi đã chuyển khoản
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Step 4 Content - Payment Successful Confirmation */}
            {step === 4 && (
              <div className="bg-primary rounded-2xl border border-secondary p-10 shadow-sm text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 border border-emerald-200 dark:border-emerald-900 mb-6">
                  <Check className="w-10 h-10 animate-bounce" />
                </div>
                
                <h2 className="text-2xl font-bold text-primary mb-3">Thanh toán thành công!</h2>
                <p className="text-sm text-secondary max-w-md mx-auto mb-8">
                  Đơn đặt thuê của bạn đã được kích hoạt thành công. Chủ đồ đã nhận được thông tin thanh toán của bạn.
                </p>

                <div className="w-full bg-secondary/50 border border-secondary rounded-xl p-6 text-left space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-secondary">Mã đơn thuê</span>
                    <span className="text-sm font-bold text-primary">RH{paymentRequest?.rentalId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-secondary">Sản phẩm</span>
                    <span className="text-sm font-bold text-primary truncate max-w-[200px]">{paymentRequest?.productName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-secondary">Số tiền đã thanh toán</span>
                    <span className="text-base font-bold text-brand-600">{finalTotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-secondary">
                    <span className="text-sm font-semibold text-secondary">Trạng thái</span>
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-full">
                      Đã thanh toán
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/rentals/renter")}
                  className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold uppercase tracking-wide transition-colors shadow-sm"
                >
                  Quản lý đơn thuê
                </button>
              </div>
            )}
          </div>

          {/* Right Column (Order Summary - Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-primary rounded-2xl border border-secondary p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-secondary pb-4">
                <Package className="w-5 h-5 text-brand-600" />
                <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Tóm tắt đơn hàng</h2>
              </div>
              
              {/* Cart List */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                {paymentRequest ? (
                  // Summary for existing Request Payment flow
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-secondary rounded-xl overflow-hidden shrink-0 border border-secondary flex items-center justify-center">
                      <Package className="w-8 h-8 text-tertiary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-primary line-clamp-2 leading-snug">
                        {paymentRequest.productName}
                      </h4>
                      <p className="text-xs font-medium text-secondary mt-1">
                        {formatDisplayDate(paymentRequest.startDate)} — {formatDisplayDate(paymentRequest.endDate)} • {
                          Math.ceil(Math.abs(new Date(paymentRequest.endDate).getTime() - new Date(paymentRequest.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
                        } ngày
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {finalSubtotal.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                ) : (
                  // Summary for Cart checkout flow
                  items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-secondary rounded-xl overflow-hidden shrink-0 border border-secondary flex items-center justify-center">
                        {getPrimaryImage(item.product) ? (
                          <img src={getPrimaryImage(item.product)} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-8 h-8 text-tertiary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-primary truncate leading-snug">{item.product.name}</h4>
                        <p className="text-xs font-medium text-secondary mt-1">
                          {item.startDate && item.endDate ? (
                            `${formatDisplayDate(item.startDate)} — ${formatDisplayDate(item.endDate)} • ${item.rentDays} ngày`
                          ) : (
                            "Chưa chọn ngày"
                          )}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {(item.product.pricePerDay * item.rentDays).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-secondary pt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-secondary">Tạm tính</span>
                  <span className="font-semibold text-primary">{finalSubtotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-secondary">Phí dịch vụ (10%)</span>
                  <span className="font-semibold text-primary">{serviceFee.toLocaleString("vi-VN")}đ</span>
                </div>
                {finalDeposit > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-secondary">Tiền cọc (Hoàn lại)</span>
                    <span className="font-semibold text-primary">{finalDeposit.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-secondary">Vận chuyển</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-500">Miễn phí</span>
                </div>

                <div className="border-t border-secondary mt-5 pt-5 flex justify-between items-end">
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">Tổng thanh toán</span>
                  <span className="text-2xl font-bold text-brand-600">{finalTotal.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              {/* Shario protect badge */}
              <div className="mt-6 bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900 rounded-xl p-4 flex items-center justify-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <span className="text-xs font-semibold text-brand-700 dark:text-brand-400">Giao dịch được bảo vệ 100%</span>
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
        <Group className="flex items-center gap-1 bg-primary border border-secondary rounded-lg px-2 py-1.5 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all text-xs font-medium max-w-fit">
          <DateInput slot="start" className="flex outline-none">
            {(segment) => (
              <DateSegment
                segment={segment}
                className="px-1 py-0.5 rounded focus:bg-brand-100 dark:focus:bg-brand-900 focus:text-brand-700 dark:focus:text-brand-100 outline-none select-none text-primary"
              />
            )}
          </DateInput>
          <span aria-hidden="true" className="text-secondary">—</span>
          <DateInput slot="end" className="flex outline-none">
            {(segment) => (
              <DateSegment
                segment={segment}
                className="px-1 py-0.5 rounded focus:bg-brand-100 dark:focus:bg-brand-900 focus:text-brand-700 dark:focus:text-brand-100 outline-none select-none text-primary"
              />
            )}
          </DateInput>
        </Group>
        <Popover className="bg-primary border border-secondary rounded-xl p-4 shadow-xl z-50">
          <Dialog className="outline-none">
            <RangeCalendar className="w-full">
              <header className="flex justify-between items-center mb-4 px-1">
                <AriaButton slot="previous" className="p-1.5 hover:bg-secondary rounded-md text-secondary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  <ChevronLeft className="w-4 h-4" />
                </AriaButton>
                <Heading className="text-sm font-semibold text-primary" />
                <AriaButton slot="next" className="p-1.5 hover:bg-secondary rounded-md text-secondary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  <ChevronRight className="w-4 h-4" />
                </AriaButton>
              </header>
              <CalendarGrid className="w-full text-center border-collapse">
                <CalendarHeaderCell className="text-xs font-semibold text-secondary pb-2" />
                <CalendarGridBody>
                  {(date) => (
                    <CalendarCell
                      date={date}
                      className={({ isSelected, isSelectionStart, isSelectionEnd, isDisabled }) => `
                        h-8 w-8 text-sm font-medium rounded-full transition-all relative flex items-center justify-center select-none cursor-pointer mx-auto outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 focus-visible:ring-offset-primary
                        ${isDisabled ? 'text-tertiary cursor-not-allowed' : 'text-primary hover:bg-secondary'}
                        ${isSelected ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400' : ''}
                        ${(isSelectionStart || isSelectionEnd) ? 'bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-full' : ''}
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
        <div className="min-h-screen w-full flex items-center justify-center bg-primary">
          <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </ProtectedRoute>
  );
}
