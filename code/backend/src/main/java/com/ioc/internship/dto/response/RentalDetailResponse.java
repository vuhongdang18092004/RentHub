package com.ioc.internship.dto.response;

import com.ioc.internship.entity.RentalStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class RentalDetailResponse {
    private Long id;
    private ProductSummaryResponse product;
    private UserSummaryResponse owner;
    private UserSummaryResponse renter;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer rentalDays;
    private BigDecimal pricePerDay;
    private BigDecimal depositAmount;
    private BigDecimal totalPrice;
    private RentalStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean reviewed;
    private Boolean canReview;
}
