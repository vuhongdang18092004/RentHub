import api from "../lib/axios";
import axios from "axios";
import { LoginInput, RegisterInput } from "../schemas/auth.schema";

const API_URL = "http://localhost:8080/api/v1/auth";

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
}

export const authService = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  verifyEmail: async (token: string) => {
    const response = await axios.get(`${API_URL}/verify-email`, {
      params: { token: encodeURIComponent(token) },
    });
    return response.data;
  },
};
