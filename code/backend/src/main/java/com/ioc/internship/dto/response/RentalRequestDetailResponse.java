package com.ioc.internship.dto.response;

import com.ioc.internship.entity.RentalRequest;
import com.ioc.internship.entity.RequestStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class RentalRequestDetailResponse {
    private Long id;
    private PublicProductSummaryResponse product;
    private PublicOwnerResponse renter;
    private BigDecimal requestedPrice;
    private BigDecimal requestedDeposit;
    private LocalDate startDate;
    private LocalDate endDate;
    private String message;
    private RequestStatus status;
    private LocalDateTime expiredAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long rentalId;
    private String rentalStatus;

    public static RentalRequestDetailResponse fromEntity(RentalRequest entity) {
        Long rentalIdVal = null;
        String rentalStatusVal = null;
        if (entity.getRentals() != null && !entity.getRentals().isEmpty()) {
            rentalIdVal = entity.getRentals().get(0).getId();
            rentalStatusVal = entity.getRentals().get(0).getStatus().name();
        }

        return RentalRequestDetailResponse.builder()
                .id(entity.getId())
                .product(PublicProductSummaryResponse.fromEntity(entity.getProduct()))
                .renter(PublicOwnerResponse.fromEntity(entity.getRenter()))
                .requestedPrice(entity.getRequestedPrice())
                .requestedDeposit(entity.getRequestedDeposit())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .message(entity.getMessage())
                .status(entity.getStatus())
                .expiredAt(entity.getExpiredAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .rentalId(rentalIdVal)
                .rentalStatus(rentalStatusVal)
                .build();
    }
}
