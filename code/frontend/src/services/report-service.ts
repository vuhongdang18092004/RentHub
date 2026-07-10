import api from "@/lib/axios";
import { 
  ReportCreateRequest, 
  ReportResponse, 
  ReportAdminResolveRequest, 
  ReportDetailAdminResponse, 
  ReportAnalyticsResponse 
} from "@/types/backend";

export const reportService = {
  // POST /api/reports
  createReport: async (data: ReportCreateRequest): Promise<ReportResponse> => {
    const res = await api.post("/reports", data);
    return res.data;
  },

  // GET /api/reports/{id}
  getReportDetail: async (id: number): Promise<ReportResponse> => {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },

  // GET /api/reports/my
  getMyReports: async (page = 0, size = 10): Promise<{ content: ReportResponse[], totalPages: number }> => {
    const res = await api.get("/reports/my", { params: { page, size } });
    return res.data;
  },

  // --- ADMIN APIs ---

  // GET /api/admin/reports
  getAllReportsAdmin: async (params: {
    page?: number;
    size?: number;
    status?: string;
    rentalId?: number;
    productId?: number;
    reporterId?: number;
    reportedUserId?: number;
  }): Promise<{ content: ReportResponse[], totalPages: number, totalElements: number }> => {
    const res = await api.get("/admin/reports", { params });
    return res.data;
  },

  // GET /api/admin/reports/{id}
  getReportDetailAdmin: async (id: number): Promise<ReportDetailAdminResponse> => {
    const res = await api.get(`/admin/reports/${id}`);
    return res.data;
  },

  // PUT /api/admin/reports/{id}/status
  updateReportStatusAdmin: async (id: number, data: ReportAdminResolveRequest): Promise<ReportResponse> => {
    const res = await api.put(`/admin/reports/${id}/status`, data);
    return res.data;
  },

  // GET /api/admin/reports/analytics
  getReportAnalyticsAdmin: async (): Promise<ReportAnalyticsResponse> => {
    const res = await api.get("/admin/reports/analytics");
    return res.data;
  }
};
