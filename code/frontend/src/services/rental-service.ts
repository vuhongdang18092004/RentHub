import api from "@/lib/axios";
import { RentalRequestDetailResponse } from "@/types/backend";

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface PublicOwnerResponse {
  id: number;
  fullName: string;
  avatarUrl: string | null;
}

export interface RentalRequestSummaryResponse {
  id: number;
  productId: number;
  productName: string;
  productImage: string | null;
  renter: PublicOwnerResponse;
  owner: PublicOwnerResponse;
  requestedPrice: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  status: RequestStatus;
  rentalStatus?: string;
  rentalId?: number;
  expiredAt: string;
  createdAt: string;
}

export interface RentalRequestStatisticsResponse {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  expired: number;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const rentalService = {
  // POST /api/renter/requests
  createRentalRequest: async (data: {
    productId: number;
    startDate: string; // "YYYY-MM-DD"
    endDate: string;   // "YYYY-MM-DD"
    message?: string;
  }): Promise<RentalRequestDetailResponse> => {
    const res = await api.post("/renter/requests", data);
    return res.data;
  },

  // GET /api/renter/requests
  getMyRentalRequests: async (
    status?: RequestStatus,
    page = 0,
    size = 10
  ): Promise<PageResponse<RentalRequestSummaryResponse>> => {
    const params: Record<string, unknown> = { page, size };
    if (status) params.status = status;
    const res = await api.get("/renter/requests", { params });
    return res.data;
  },

  // GET /api/renter/requests/{id}
  getMyRentalRequestDetail: async (id: number): Promise<RentalRequestDetailResponse> => {
    const res = await api.get(`/renter/requests/${id}`);
    return res.data;
  },

  // PUT /api/renter/requests/{id}/cancel
  cancelRentalRequest: async (id: number): Promise<void> => {
    await api.put(`/renter/requests/${id}/cancel`);
  },

  // GET /api/owner/requests
  getOwnerRentalRequests: async (params: {
    status?: RequestStatus;
    productId?: number;
    keyword?: string;
    sort?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<RentalRequestSummaryResponse>> => {
    const res = await api.get("/owner/requests", { params });
    return res.data;
  },

  // GET /api/owner/requests/statistics
  getOwnerRentalRequestStatistics: async (): Promise<RentalRequestStatisticsResponse> => {
    const res = await api.get("/owner/requests/statistics");
    return res.data;
  },

  // PUT /api/owner/requests/{id}/approve
  approveRentalRequest: async (id: number): Promise<void> => {
    await api.put(`/owner/requests/${id}/approve`);
  },

  // PUT /api/owner/requests/{id}/reject
  rejectRentalRequest: async (id: number): Promise<void> => {
    await api.put(`/owner/requests/${id}/reject`);
  },

  // GET /api/renter/rentals/{id}/payment-info
  getRentalPaymentInfo: async (rentalId: number): Promise<{
    rentalId: number;
    totalPrice: number;
    depositAmount: number;
    bankAccountNumber: string;
    bankCode: string;
    bankAccountHolderName: string;
    paymentContent: string;
    status: string;
  }> => {
    const res = await api.get(`/renter/rentals/${rentalId}/payment-info`);
    return res.data;
  },

  // POST /api/renter/rentals/{id}/confirm-payment
  confirmRentalPayment: async (rentalId: number): Promise<void> => {
    await api.post(`/renter/rentals/${rentalId}/confirm-payment`);
  },

  // POST /api/renter/rentals/{id}/return
  requestReturn: async (rentalId: number): Promise<void> => {
    await api.post(`/renter/rentals/${rentalId}/return`);
  },

  // POST /api/owner/rentals/{id}/confirm-return
  confirmReturn: async (rentalId: number): Promise<void> => {
    await api.post(`/owner/rentals/${rentalId}/confirm-return`);
  },
};
