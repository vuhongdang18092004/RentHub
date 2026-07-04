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

const PROFILE_API_URL = "/users/profile";

export interface PublicOwnerResponse {
  id: number;
  fullName: string;
  avatarUrl: string | null;
}

export const userService = {
  getMyProfile: async (): Promise<UserResponse> => {
    const res = await api.get(PROFILE_API_URL);
    return res.data;
  },

  updateMyProfile: async (data: UserUpdateRequest): Promise<UserResponse> => {
    const res = await api.put(PROFILE_API_URL, data);
    return res.data;
  },

  getPublicProfile: async (id: number): Promise<PublicOwnerResponse> => {
    const response = await fetch(`http://localhost:8080/api/users/${id}/public`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Không thể tải thông tin hồ sơ công khai!");
    }
    return response.json();
  }
};
