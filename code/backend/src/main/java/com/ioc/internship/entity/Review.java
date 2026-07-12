package com.ioc.internship.entity;

import com.ioc.internship.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reviews", uniqueConstraints = {
        @UniqueConstraint(columnNames = "rental_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_id", nullable = false)
    private Rental rental;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private UserEntity reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_user_id", nullable = false)
    private UserEntity reviewedUser;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String comment;

    // Moderation fields
    @Column(name = "is_hidden")
    @Builder.Default
    private Boolean isHidden = false;

    @Column(name = "hidden_reason", columnDefinition = "TEXT")
    private String hiddenReason;

    @Column(name = "hidden_by")
    private Long hiddenBy; // Admin user ID

    @Column(name = "hidden_at")
    private java.time.LocalDateTime hiddenAt;
}
