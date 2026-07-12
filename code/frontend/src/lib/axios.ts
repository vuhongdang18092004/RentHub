import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động đính kèm Token vào Header cho các API cần bảo mật
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự động xử lý khi Token hết hạn hoặc không hợp lệ (lỗi 401 hoặc 403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("fullName");

      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        // Chỉ redirect nếu đang ở các trang dashboard/bảo mật, không redirect khi ở trang chủ/login/register
        if (!path.includes("/login") && !path.includes("/register") && path !== "/") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;