import api from "@/lib/axios";
import { ReportCreateRequest, ReportResponse } from "@/types/backend";

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
};
