import api from "@/lib/axios";
import { PaymentRecordRequest, PaymentResponse, RefundRequest } from "@/types/backend";
import { PageResponse } from "./rental-service";

export const paymentService = {
  // POST /api/payments
  recordPayment: async (data: PaymentRecordRequest): Promise<PaymentResponse> => {
    const res = await api.post("/payments", data);
    return res.data;
  },

  // POST /api/payments/refunds
  recordRefund: async (data: RefundRequest): Promise<PaymentResponse> => {
    const res = await api.post("/payments/refunds", data);
    return res.data;
  },

  // GET /api/payments/rentals/{rentalId}
  getPaymentsByRental: async (
    rentalId: number,
    page = 0,
    size = 10
  ): Promise<PageResponse<PaymentResponse>> => {
    const res = await api.get(`/payments/rentals/${rentalId}`, { params: { page, size } });
    return res.data;
  },
};
