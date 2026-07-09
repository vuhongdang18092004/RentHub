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

  // GET /api/rentals/{id}
  getRentalDetail: async (id: number): Promise<import("@/types/backend").RentalDetailResponse> => {
    const res = await api.get(`/rentals/${id}`);
    return res.data;
  },

  // PUT /api/rentals/{id}/handover
  handoverRental: async (id: number): Promise<import("@/types/backend").RentalLifecycleResponse> => {
    const res = await api.put(`/rentals/${id}/handover`);
    return res.data;
  },

  // PUT /api/rentals/{id}/receive
  receiveRental: async (id: number): Promise<import("@/types/backend").RentalLifecycleResponse> => {
    const res = await api.put(`/rentals/${id}/receive`);
    return res.data;
  },

  // PUT /api/rentals/{id}/reject
  rejectRental: async (id: number): Promise<import("@/types/backend").RentalLifecycleResponse> => {
    const res = await api.put(`/rentals/${id}/reject`);
    return res.data;
  },

  // PUT /api/rentals/{id}/return
  returnRental: async (id: number): Promise<import("@/types/backend").RentalLifecycleResponse> => {
    const res = await api.put(`/rentals/${id}/return`);
    return res.data;
  },

  // PUT /api/rentals/{id}/complete
  completeRental: async (id: number): Promise<import("@/types/backend").RentalLifecycleResponse> => {
    const res = await api.put(`/rentals/${id}/complete`);
    return res.data;
  },

  confirmReturn: async (id: number): Promise<import("@/types/backend").RentalLifecycleResponse> => {
    const res = await api.put(`/rentals/${id}/complete`);
    return res.data;
  },
};
