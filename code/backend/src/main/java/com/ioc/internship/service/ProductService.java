package com.ioc.internship.service;
import com.ioc.internship.dto.request.CreateProductRequest;
import com.ioc.internship.dto.request.UpdateProductRequest;
import com.ioc.internship.dto.response.ProductDetailResponse;
import com.ioc.internship.dto.response.ProductSummaryResponse;
import com.ioc.internship.entity.ProductStatus;
import org.springframework.data.domain.Page;
public interface ProductService {
    ProductDetailResponse createProduct(CreateProductRequest request, String email);
    ProductDetailResponse updateProduct(Long id, UpdateProductRequest request, String email);
    void deleteProduct(Long id, String email);
    Page<ProductSummaryResponse> getMyProducts(String email, ProductStatus status, int page, int size);
    ProductDetailResponse getProductDetail(Long id, String email);
    Page<ProductSummaryResponse> getAllProductsAdmin(ProductStatus status, int page, int size);
    void updateProductStatusAdmin(Long id, com.ioc.internship.dto.request.UpdateProductStatusRequest request);
    void updateMyProductStatus(Long id, com.ioc.internship.dto.request.UpdateMyProductStatusRequest request, String email);
    Page<ProductSummaryResponse> getAvailableProducts(int page, int size, Long categoryId);
    ProductDetailResponse getPublicProductDetail(Long id);
}