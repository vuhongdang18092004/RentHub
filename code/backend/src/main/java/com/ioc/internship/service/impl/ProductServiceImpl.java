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
                .status(ProductStatus.PENDING)
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

        if (product.getStatus() == ProductStatus.RENTED) {
            throw new RuntimeException("400 Bad Request: Cannot update a product that is currently RENTED");
        }

        if (request.getStatus() != null && request.getStatus() != product.getStatus()) {
            if ((product.getStatus() == ProductStatus.AVAILABLE && request.getStatus() == ProductStatus.UNAVAILABLE) ||
                (product.getStatus() == ProductStatus.UNAVAILABLE && request.getStatus() == ProductStatus.AVAILABLE)) {
                // valid transition
            } else {
                throw new RuntimeException("400 Bad Request: Invalid status transition. Owner can only change between AVAILABLE and UNAVAILABLE.");
            }
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

        if (product.getStatus() == ProductStatus.RENTED) {
            throw new RuntimeException("400 Bad Request: Cannot delete a product that is currently RENTED");
        }

        productRepository.delete(product);
    }

    @Override
    public Page<ProductSummaryResponse> getMyProducts(String email, ProductStatus status, int page, int size) {
        UserEntity owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        if (status != null) {
            return productRepository.findByOwnerIdAndStatusOrderByCreatedAtDesc(owner.getId(), status, pageable)
                    .map(ProductSummaryResponse::fromEntity);
        }
        
        return productRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId(), pageable)
                .map(ProductSummaryResponse::fromEntity);
    }

    @Override
    public ProductDetailResponse getProductDetail(Long id, String email) {
        UserEntity owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getOwner().getId().equals(owner.getId()) && !"ROLE_ADMIN".equals(owner.getRole())) {
            throw new RuntimeException("403 Forbidden: You are not the owner of this product");
        }

        return ProductDetailResponse.fromEntity(product);
    }

    @Override
    public Page<ProductSummaryResponse> getAllProductsAdmin(ProductStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        if (status != null) {
            return productRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                    .map(ProductSummaryResponse::fromEntity);
        }
        
        return productRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(ProductSummaryResponse::fromEntity);
    }

    @Override
    @Transactional
    public void updateProductStatusAdmin(Long id, com.ioc.internship.dto.request.UpdateProductStatusRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        ProductStatus newStatus = request.getStatus();

        if (newStatus != ProductStatus.AVAILABLE && newStatus != ProductStatus.BLOCKED) {
            throw new RuntimeException("400 Bad Request: Admin can only set status to AVAILABLE or BLOCKED");
        }

        if (product.getStatus() == ProductStatus.RENTED) {
             throw new RuntimeException("400 Bad Request: Cannot change status of a RENTED product");
        }
        if (product.getStatus() == ProductStatus.UNAVAILABLE) {
             throw new RuntimeException("400 Bad Request: Cannot change status of an UNAVAILABLE product");
        }

        product.setStatus(newStatus);
        productRepository.save(product);
    }

    @Override
    @Transactional
    public void updateMyProductStatus(Long id, com.ioc.internship.dto.request.UpdateMyProductStatusRequest request, String email) {
        UserEntity owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("403 Forbidden: You are not the owner of this product");
        }

        ProductStatus currentStatus = product.getStatus();
        if (currentStatus == ProductStatus.PENDING || currentStatus == ProductStatus.BLOCKED || currentStatus == ProductStatus.RENTED) {
            throw new RuntimeException("400 Bad Request: Cannot change status of a PENDING, BLOCKED, or RENTED product");
        }

        ProductStatus newStatus = request.getStatus();
        if (newStatus != ProductStatus.AVAILABLE && newStatus != ProductStatus.UNAVAILABLE) {
            throw new RuntimeException("400 Bad Request: Owner can only set status to AVAILABLE or UNAVAILABLE");
        }

        product.setStatus(newStatus);
        productRepository.save(product);
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
    public com.ioc.internship.dto.response.PublicProductDetailResponse getPublicProductDetail(Long id) {
        Product product = productRepository.findByIdAndStatus(id, ProductStatus.AVAILABLE)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Product not found or not available"));
        return com.ioc.internship.dto.response.PublicProductDetailResponse.fromEntity(product);
    }

    @Override
    public Page<com.ioc.internship.dto.response.PublicProductSummaryResponse> getPublicProducts(
            int page, int size, String keyword, List<Long> categoryIds,
            BigDecimal minPrice, BigDecimal maxPrice,
            String address, BigDecimal latitude, BigDecimal longitude,
            Double radius, String sort) {
        
        Sort sortObj = Sort.by(Sort.Direction.DESC, "createdAt"); // default newest
        if ("price_asc".equalsIgnoreCase(sort)) {
            sortObj = Sort.by(Sort.Direction.ASC, "pricePerDay");
        } else if ("price_desc".equalsIgnoreCase(sort)) {
            sortObj = Sort.by(Sort.Direction.DESC, "pricePerDay");
        }
        
        Pageable pageable = PageRequest.of(page, size, sortObj);
        
        org.springframework.data.jpa.domain.Specification<Product> spec = 
                com.ioc.internship.repository.specification.ProductSpecification.buildPublicFilters(
                        keyword, categoryIds, minPrice, maxPrice, address, latitude, longitude, radius);
                        
        return productRepository.findAll(spec, pageable)
                .map(com.ioc.internship.dto.response.PublicProductSummaryResponse::fromEntity);
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
