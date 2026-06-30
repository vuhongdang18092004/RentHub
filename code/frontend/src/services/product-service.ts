import api from "@/lib/axios";

export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface ProductSummary {
  id: number;
  name: string;
  pricePerDay: number;
  status: "AVAILABLE" | "RENTED" | "UNAVAILABLE";
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
};
