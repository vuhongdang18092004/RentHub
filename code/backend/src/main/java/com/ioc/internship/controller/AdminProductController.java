package com.ioc.internship.controller;

import com.ioc.internship.dto.request.UpdateProductStatusRequest;
import com.ioc.internship.dto.response.ProductSummaryResponse;
import com.ioc.internship.entity.ProductStatus;
import com.ioc.internship.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductSummaryResponse>> getAllProducts(
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(productService.getAllProductsAdmin(status, page, size));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateProductStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductStatusRequest request) {
        productService.updateProductStatusAdmin(id, request);
        return ResponseEntity.noContent().build();
    }
}
