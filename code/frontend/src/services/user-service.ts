import api from "../lib/axios";

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdateRequest {
  fullName: string;
  phone: string;
  avatarUrl?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
}

const PROFILE_API_URL = "http://localhost:8080/api/users/profile";

export const userService = {
  getMyProfile: async (): Promise<UserResponse> => {
    const res = await api.get(PROFILE_API_URL);
    return res.data;
  },

  updateMyProfile: async (data: UserUpdateRequest): Promise<UserResponse> => {
    const res = await api.put(PROFILE_API_URL, data);
    return res.data;
  }
};
