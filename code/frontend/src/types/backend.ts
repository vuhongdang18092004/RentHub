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


export type RentalStatus = 'WAITING_PAYMENT' | 'HANDOVER_PENDING' | 'ACTIVE' | 'RETURN_PENDING' | 'COMPLETED' | 'CANCELLED';

export type PaymentType = 'DEPOSIT' | 'RENTAL_FEE' | 'REFUND_CANCEL' | 'REFUND_DEPOSIT';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type PaymentMethod = 'PAYOS' | 'VNPAY';

export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
export type ReportReason = 'PRODUCT_NOT_AS_DESCRIBED' | 'DAMAGED_PRODUCT' | 'LATE_RETURN' | 'PAYMENT_DISPUTE' | 'NO_SHOW' | 'OTHER';
export type ResolutionAction = 'NO_ACTION' | 'REFUND_FULL' | 'REFUND_PARTIAL' | 'PENALTY_FEE';

export interface RentalLifecycleResponse {
  rentalId: number;
  status: RentalStatus;
  message: string;
}

export interface PaymentRecordRequest {
  rentalId: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  amount: number;
  transactionCode?: string;
  status: PaymentStatus;
}

export interface RefundRequest {
  rentalId: number;
  paymentType: PaymentType;
  amount: number;
  transactionCode: string;
}

export interface PaymentResponse {
  id: number;
  rentalId: number;
  payerId: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  amount: number;
  transactionCode?: string;
  status: PaymentStatus;
  paidAt: string;
}

export interface ReportCreateRequest {
  rentalId: number;
  reason: ReportReason;
  description: string;
  evidenceImageUrl?: string;
}

export interface ReportResponse {
  id: number;
  reporterId: number;
  reportedUserId: number;
  rentalId: number;
  productId: number;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  adminNote?: string;
  evidenceImageUrl?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentalDetailResponse {
  id: number;
  product: ProductSummaryResponse;
  owner: UserSummaryResponse;
  renter: UserSummaryResponse;
  startDate: string;
  endDate: string;
  rentalDays: number;
  pricePerDay: number;
  depositAmount: number;
  totalPrice: number;
  status: RentalStatus;
  createdAt: string;
  updatedAt: string;
}
