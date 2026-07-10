import api from '@/lib/axios';
import { PageResponse } from '@/types/api';
import { ReviewRequest, ReviewResponse, AdminReviewAnalyticsResponse } from '@/types/backend';

export const reviewService = {
  // Public API
  getProductReviews: async (productId: number, page: number = 0, size: number = 10, sort: string = 'newest'): Promise<PageResponse<ReviewResponse>> => {
    const res = await api.get(`/products/${productId}/reviews`, {
      params: { page, size, sort }
    });
    return res.data;
  },

  getReviewDetail: async (id: number): Promise<ReviewResponse> => {
    const res = await api.get(`/reviews/${id}`);
    return res.data;
  },

  // Renter API
  createReview: async (data: ReviewRequest): Promise<ReviewResponse> => {
    const res = await api.post('/reviews', data).catch(err => {
      console.error("API Error Response:", err.response?.data);
      throw err;
    });
    return res.data;
  },

  // Admin API
  getAllReviewsAdmin: async (page: number = 0, size: number = 10): Promise<PageResponse<ReviewResponse>> => {
    const res = await api.get('/admin/reviews', {
      params: { page, size }
    });
    return res.data;
  },

  deleteReviewAdmin: async (id: number): Promise<void> => {
    await api.delete(`/admin/reviews/${id}`);
  },

  getReviewAnalyticsAdmin: async (): Promise<AdminReviewAnalyticsResponse> => {
    const res = await api.get('/admin/reviews/analytics');
    return res.data;
  }
};
