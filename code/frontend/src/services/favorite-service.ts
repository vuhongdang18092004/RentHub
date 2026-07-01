import api from "@/lib/axios";

export interface FavoriteItem {
  favoriteId: number;
  productId: number;
  productName: string;
  thumbnail: string;
  rentalPrice: number;
  productStatus: string;
  productStatusMessage: string;
  createdAt: string;
}

export interface FavoritePageResponse {
  content: FavoriteItem[];
  pageable: any;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: any;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export const favoriteService = {
  // Add product to favorites
  addFavorite: async (productId: number): Promise<void> => {
    await api.post("/favorites", { productId });
  },

  // Get current user's favorites
  getMyFavorites: async (page = 0, size = 10): Promise<FavoritePageResponse> => {
    const res = await api.get(`/favorites?page=${page}&size=${size}`);
    return res.data;
  },

  // Remove product from favorites
  removeFavorite: async (productId: number): Promise<void> => {
    await api.delete(`/favorites/${productId}`);
  }
};
