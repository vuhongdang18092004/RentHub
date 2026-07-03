package com.ioc.internship.controller;

import com.ioc.internship.dto.request.CreateProductRequest;
import com.ioc.internship.dto.request.UpdateProductRequest;
import com.ioc.internship.dto.response.ProductDetailResponse;
import com.ioc.internship.dto.response.ProductSummaryResponse;
import com.ioc.internship.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProductDetailResponse> createProduct(
            @Valid @RequestBody CreateProductRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return new ResponseEntity<>(productService.createProduct(request, email), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<ProductSummaryResponse>> getAvailableProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(productService.getAvailableProducts(page, size, categoryId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<ProductSummaryResponse>> getMyProducts(
            @RequestParam(required = false) com.ioc.internship.entity.ProductStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(productService.getMyProducts(email, status, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProductDetailResponse> getProductDetail(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(productService.getProductDetail(id, email));
    }

    @GetMapping("/public")
    public ResponseEntity<Page<com.ioc.internship.dto.response.PublicProductSummaryResponse>> getPublicProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) java.math.BigDecimal latitude,
            @RequestParam(required = false) java.math.BigDecimal longitude,
            @RequestParam(required = false) Double radius,
            @RequestParam(defaultValue = "newest") String sort) {
        return ResponseEntity.ok(productService.getPublicProducts(
                page, size, keyword, categoryId, minPrice, maxPrice, address, latitude, longitude, radius, sort));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<com.ioc.internship.dto.response.PublicProductDetailResponse> getPublicProductDetailApi(
            @PathVariable Long id) {
        return ResponseEntity.ok(productService.getPublicProductDetail(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProductDetailResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(productService.updateProduct(id, request, email));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        productService.deleteProduct(id, email);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> updateMyProductStatus(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody com.ioc.internship.dto.request.UpdateMyProductStatusRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        productService.updateMyProductStatus(id, request, email);
        return ResponseEntity.noContent().build();
    }
}
