import api from "@/lib/axios";

export enum NotificationType {
  RENTAL_REQUEST_CREATED = 'RENTAL_REQUEST_CREATED',
  RENTAL_REQUEST_APPROVED = 'RENTAL_REQUEST_APPROVED',
  RENTAL_REQUEST_REJECTED = 'RENTAL_REQUEST_REJECTED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  RENTAL_HANDOVER_PENDING = 'RENTAL_HANDOVER_PENDING',
  RENTAL_RECEIVED = 'RENTAL_RECEIVED',
  RENTAL_RETURN_PENDING = 'RENTAL_RETURN_PENDING',
  RENTAL_COMPLETED = 'RENTAL_COMPLETED',
  REPORT_SUBMITTED_TO_ADMIN = 'REPORT_SUBMITTED_TO_ADMIN',
  REPORT_RESOLVED_FOR_REPORTER = 'REPORT_RESOLVED_FOR_REPORTER',
  REFUND_REQUIRED = 'REFUND_REQUIRED',
  REFUND_COMPLETED = 'REFUND_COMPLETED',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
}

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationSummaryResponse {
  unreadCount: number;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const notificationService = {
  getMyNotifications: async (page = 0, size = 10): Promise<Page<NotificationResponse>> => {
    const res = await api.get(`/notifications?page=${page}&size=${size}`);
    return res.data;
  },

  getRecentNotifications: async (size = 5): Promise<NotificationResponse[]> => {
    const res = await api.get(`/notifications/recent?size=${size}`);
    return res.data;
  },

  getUnreadCount: async (): Promise<NotificationSummaryResponse> => {
    const res = await api.get('/notifications/unread-count');
    return res.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },

  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};
