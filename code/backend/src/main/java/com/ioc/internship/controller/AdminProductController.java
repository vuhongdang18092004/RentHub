package com.ioc.internship.controller;

import com.ioc.internship.dto.response.ProductDetailResponse;
import com.ioc.internship.dto.response.ProductSummaryResponse;
import com.ioc.internship.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    @GetMapping("/pending")
    public ResponseEntity<Page<ProductSummaryResponse>> getPendingProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(productService.getPendingProducts(page, size));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ProductDetailResponse> approveProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.approveProduct(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ProductDetailResponse> rejectProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.rejectProduct(id));
    }
}
