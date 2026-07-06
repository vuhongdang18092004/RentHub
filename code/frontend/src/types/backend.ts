// TODO: TypeScript type definitions mapped directly from com.ioc.internship.dto and com.ioc.internship.entity packages in backend.

/**
 * Mapped from com.ioc.internship.entity.ProductStatus
 */
export type ProductStatus = 'AVAILABLE' | 'RENTED' | 'UNAVAILABLE';

/**
 * Mapped from com.ioc.internship.dto.request.LoginRequest
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Mapped from com.ioc.internship.dto.request.RegisterRequest
 */
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

/**
 * Mapped from com.ioc.internship.dto.response.AuthResponse
 */
export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
}

/**
 * Mapped from com.ioc.internship.dto.response.UserSummaryResponse
 */
export interface UserSummaryResponse {
  id: number;
  email: string;
  fullName: string;
}

/**
 * Mapped from com.ioc.internship.dto.response.CategoryResponse
 */
export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
}

/**
 * Mapped from com.ioc.internship.dto.request.CategoryRequest
 */
export interface CategoryRequest {
  name: string;
  description?: string;
}

/**
 * Mapped from com.ioc.internship.dto.request.ProductImageRequest
 */
export interface ProductImageRequest {
  imageUrl: string;
  isPrimary: boolean;
}

/**
 * Mapped from com.ioc.internship.dto.response.ProductImageResponse
 */
export interface ProductImageResponse {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

/**
 * Mapped from com.ioc.internship.dto.request.CreateProductRequest
 */
export interface CreateProductRequest {
  categoryId: number;
  name: string;
  description?: string;
  pricePerDay: number;
  depositAmount: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  images?: ProductImageRequest[];
}

/**
 * Mapped from com.ioc.internship.dto.request.UpdateProductRequest
 */
export interface UpdateProductRequest {
  categoryId?: number;
  name?: string;
  description?: string;
  pricePerDay?: number;
  depositAmount?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  status?: ProductStatus;
  images?: ProductImageRequest[];
}

/**
 * Mapped from com.ioc.internship.dto.response.ProductSummaryResponse
 */
export interface ProductSummaryResponse {
  id: number;
  name: string;
  pricePerDay: number;
  depositAmount: number;
  address?: string;
  status: ProductStatus;
  primaryImageUrl?: string;
  categoryName: string;
  ownerName: string;
}

/**
 * Mapped from com.ioc.internship.dto.response.ProductDetailResponse
 */
export interface ProductDetailResponse {
  id: number;
  name: string;
  description?: string;
  pricePerDay: number;
  depositAmount: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: ProductStatus;
  category: CategoryResponse;
  owner: UserSummaryResponse;
  images: ProductImageResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface RentalRequestDetailResponse {
  id: number;
  productId: number;
  productName: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  message?: string;
  createdAt: string;
  rentalId?: number;
  rentalStatus?: string;
}

