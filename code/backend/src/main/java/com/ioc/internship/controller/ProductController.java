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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(productService.getMyProducts(email, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProductDetailResponse> getProductDetail(
            @PathVariable Long id,
            Authentication authentication) {
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
}
