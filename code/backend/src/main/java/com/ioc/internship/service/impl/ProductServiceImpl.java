package com.ioc.internship.service.impl;

import com.ioc.internship.dto.request.CreateProductRequest;
import com.ioc.internship.dto.request.ProductImageRequest;
import com.ioc.internship.dto.request.UpdateProductRequest;
import com.ioc.internship.dto.response.ProductDetailResponse;
import com.ioc.internship.dto.response.ProductSummaryResponse;
import com.ioc.internship.entity.Category;
import com.ioc.internship.entity.Product;
import com.ioc.internship.entity.ProductImage;
import com.ioc.internship.entity.ProductStatus;
import com.ioc.internship.entity.UserEntity;
import com.ioc.internship.repository.CategoryRepository;
import com.ioc.internship.repository.ProductImageRepository;
import com.ioc.internship.repository.ProductRepository;
import com.ioc.internship.repository.UserRepository;
import com.ioc.internship.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ProductDetailResponse createProduct(CreateProductRequest request, String email) {
        UserEntity owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (request.getImages() == null || request.getImages().isEmpty()) {
            throw new RuntimeException("Product must have at least one image");
        }

        Product product = Product.builder()
                .owner(owner)
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .pricePerDay(request.getPricePerDay())
                .depositAmount(request.getDepositAmount())
                .status(ProductStatus.AVAILABLE)
                .build();

        setAddressFields(product, request.getAddress(), request.getLatitude(), request.getLongitude(), owner);
        handleImages(product, request.getImages());

        product = productRepository.save(product);
        return ProductDetailResponse.fromEntity(product);
    }

    @Override
    @Transactional
    public ProductDetailResponse updateProduct(Long id, UpdateProductRequest request, String email) {
        UserEntity owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("403 Forbidden: You are not the owner of this product");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (request.getImages() == null || request.getImages().isEmpty()) {
            throw new RuntimeException("Product must have at least one image");
        }

        product.setCategory(category);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPricePerDay(request.getPricePerDay());
        product.setDepositAmount(request.getDepositAmount());
        product.setStatus(request.getStatus());

        setAddressFields(product, request.getAddress(), request.getLatitude(), request.getLongitude(), owner);
        
        product.getImages().clear();
        handleImages(product, request.getImages());

        product = productRepository.save(product);
        return ProductDetailResponse.fromEntity(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id, String email) {
        UserEntity owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("403 Forbidden: You are not the owner of this product");
        }

        productRepository.delete(product);
    }

    @Override
    public Page<ProductSummaryResponse> getMyProducts(String email, int page, int size) {
        UserEntity owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId(), pageable)
                .map(ProductSummaryResponse::fromEntity);
    }

    @Override
    public ProductDetailResponse getProductDetail(Long id, String email) {
        UserEntity owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("403 Forbidden: You are not the owner of this product");
        }

        return ProductDetailResponse.fromEntity(product);
    }

    @Override
    public Page<ProductSummaryResponse> getAvailableProducts(int page, int size, Long categoryId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (categoryId != null) {
            return productRepository.findByStatusAndCategoryIdOrderByCreatedAtDesc(
                    ProductStatus.AVAILABLE, categoryId, pageable)
                    .map(ProductSummaryResponse::fromEntity);
        }
        return productRepository.findByStatusOrderByCreatedAtDesc(ProductStatus.AVAILABLE, pageable)
                .map(ProductSummaryResponse::fromEntity);
    }

    @Override
    public ProductDetailResponse getPublicProductDetail(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return ProductDetailResponse.fromEntity(product);
    }

    private void setAddressFields(Product product, String address, BigDecimal latitude, BigDecimal longitude, UserEntity owner) {
        if (address != null && latitude != null && longitude != null) {
            product.setAddress(address);
            product.setLatitude(latitude);
            product.setLongitude(longitude);
        } else {
            product.setAddress(owner.getAddress());
            product.setLatitude(owner.getLatitude());
            product.setLongitude(owner.getLongitude());
        }
    }

    private void handleImages(Product product, List<ProductImageRequest> imageRequests) {
        long primaryCount = imageRequests.stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .count();

        if (primaryCount > 1) {
            throw new RuntimeException("Product can only have one primary image");
        }

        boolean autoSetPrimary = primaryCount == 0;

        for (int i = 0; i < imageRequests.size(); i++) {
            ProductImageRequest imgReq = imageRequests.get(i);
            boolean isPrimary = Boolean.TRUE.equals(imgReq.getIsPrimary());
            if (autoSetPrimary && i == 0) {
                isPrimary = true;
            }

            ProductImage image = ProductImage.builder()
                    .imageUrl(imgReq.getImageUrl())
                    .isPrimary(isPrimary)
                    .build();
            product.addImage(image);
        }
    }
}
