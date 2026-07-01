package com.ioc.internship.service;

import com.ioc.internship.dto.request.CreateProductRequest;
import com.ioc.internship.dto.request.UpdateProductRequest;
import com.ioc.internship.dto.response.ProductDetailResponse;
import com.ioc.internship.dto.response.ProductSummaryResponse;
import org.springframework.data.domain.Page;

public interface ProductService {
    ProductDetailResponse createProduct(CreateProductRequest request, String email);
    ProductDetailResponse updateProduct(Long id, UpdateProductRequest request, String email);
    void deleteProduct(Long id, String email);
    Page<ProductSummaryResponse> getMyProducts(String email, int page, int size);
    ProductDetailResponse getProductDetail(Long id, String email);
    Page<ProductSummaryResponse> getAvailableProducts(int page, int size, Long categoryId);
    ProductDetailResponse getPublicProductDetail(Long id);
}
