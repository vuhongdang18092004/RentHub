import api from "@/lib/axios";
import { CategoryResponse } from "@/types/backend";

export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface ProductSummary {
  id: number;
  name: string;
  pricePerDay: number;
  status: "PENDING" | "AVAILABLE" | "RENTED" | "UNAVAILABLE" | "BLOCKED";
  category: {
    id: number;
    name: string;
    slug: string;
  };
  primaryImage: string | null;
  createdAt: string;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  depositAmount: number;
  address: string;
  latitude: number | null;
  longitude: number | null;
  owner: {
    id: number;
    fullName: string;
    email: string;
  };
  images: ProductImage[];
  updatedAt: string;
}

export interface CreateProductInput {
  categoryId: number;
  name: string;
  description: string;
  pricePerDay: number;
  depositAmount: number;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  images: { imageUrl: string; isPrimary: boolean }[];
}

export const productService = {
  getMyProducts: async (page = 0, size = 10): Promise<{ content: ProductSummary[]; totalElements: number }> => {
    const res = await api.get(`/products/my`, {
      params: { page, size },
    });
    return res.data;
  },

  getProductDetail: async (id: number): Promise<ProductDetail> => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  createProduct: async (data: CreateProductInput): Promise<ProductDetail> => {
    const res = await api.post(`/products`, data);
    return res.data;
  },

  updateProduct: async (id: number, data: Partial<CreateProductInput> & { status?: string }): Promise<ProductDetail> => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Public listing — all AVAILABLE products (not owner-restricted)
  getAvailableProducts: async (
    page = 0,
    size = 12,
    categoryId?: number
  ): Promise<{ content: ProductSummary[]; totalElements: number; totalPages: number }> => {
    const params: Record<string, unknown> = { page, size };
    if (categoryId) params.categoryId = categoryId;
    const res = await api.get(`/products`, { params });
    return res.data;
  },

  // Public detail — any authenticated user can view
  getPublicProductDetail: async (id: number): Promise<ProductDetail> => {
    const res = await api.get(`/products/public/${id}`);
    return res.data;
  },

  // Public search and filtering
  getPublicProducts: async (params: {
    page?: number;
    size?: number;
    keyword?: string;
    categoryIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    address?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    sort?: "newest" | "price_asc" | "price_desc" | "relevant";
  }): Promise<{ content: PublicProductSummaryResponse[]; totalElements: number; totalPages: number }> => {
    const res = await api.get("/products/public", {
      params,
      paramsSerializer: {
        indexes: null,
      },
    });
    return res.data;
  },

  getCategories: async (): Promise<CategoryResponse[]> => {
    const res = await api.get("/categories");
    return res.data;
  },
};

export interface PublicProductSummaryResponse {
  id: number;
  name: string;
  pricePerDay: number;
  depositAmount: number;
  address: string | null;
  categoryName: string;
  ownerFullName: string;
  primaryImageUrl: string | null;
  status: "PENDING" | "AVAILABLE" | "RENTED" | "UNAVAILABLE" | "BLOCKED";
  createdAt: string;
}


