package com.ioc.internship.entity;

import com.ioc.internship.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private UserEntity owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_per_day", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerDay;

    @Column(name = "deposit_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal depositAmount;

    private String address;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProductStatus status = ProductStatus.AVAILABLE;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @Column(name = "review_count", nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "average_rating", nullable = false, precision = 3, scale = 1, columnDefinition = "numeric(3,1) default 0.0")
    @Builder.Default
    private BigDecimal averageRating = BigDecimal.ZERO;

    public void addImage(ProductImage image) {
        images.add(image);
        image.setProduct(this);
    }

    public void removeImage(ProductImage image) {
        images.remove(image);
        image.setProduct(null);
    }

    public void addReviewRating(int rating) {
        if (reviewCount == null) reviewCount = 0;
        if (averageRating == null) averageRating = BigDecimal.ZERO;
        
        BigDecimal oldTotal = averageRating.multiply(BigDecimal.valueOf(reviewCount));
        reviewCount++;
        BigDecimal newTotal = oldTotal.add(BigDecimal.valueOf(rating));
        averageRating = newTotal.divide(BigDecimal.valueOf(reviewCount), 1, java.math.RoundingMode.HALF_UP);
    }

    public void removeReviewRating(int rating) {
        if (reviewCount == null || reviewCount <= 0) return;
        if (averageRating == null) averageRating = BigDecimal.ZERO;
        
        BigDecimal oldTotal = averageRating.multiply(BigDecimal.valueOf(reviewCount));
        reviewCount--;
        if (reviewCount == 0) {
            averageRating = BigDecimal.ZERO;
        } else {
            BigDecimal newTotal = oldTotal.subtract(BigDecimal.valueOf(rating));
            averageRating = newTotal.divide(BigDecimal.valueOf(reviewCount), 1, java.math.RoundingMode.HALF_UP);
        }
    }
}
