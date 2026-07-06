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
public class RentalRequestSummaryResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private PublicOwnerResponse renter;
    private PublicOwnerResponse owner;
    private BigDecimal requestedPrice;
    private LocalDate startDate;
    private LocalDate endDate;
    private RequestStatus status;
    private LocalDateTime expiredAt;
    private LocalDateTime createdAt;
    private String rentalStatus;
    private Long rentalId;

    public static RentalRequestSummaryResponse fromEntity(RentalRequest entity) {
        String primaryImage = null;
        if (entity.getProduct().getImages() != null && !entity.getProduct().getImages().isEmpty()) {
            primaryImage = entity.getProduct().getImages().get(0).getImageUrl();
        }

        String rentalStatusVal = null;
        Long rentalIdVal = null;
        if (entity.getRentals() != null && !entity.getRentals().isEmpty()) {
            rentalIdVal = entity.getRentals().get(0).getId();
            rentalStatusVal = entity.getRentals().get(0).getStatus().name();
        }

        return RentalRequestSummaryResponse.builder()
                .id(entity.getId())
                .productId(entity.getProduct().getId())
                .productName(entity.getProduct().getName())
                .productImage(primaryImage)
                .renter(PublicOwnerResponse.fromEntity(entity.getRenter()))
                .owner(PublicOwnerResponse.fromEntity(entity.getOwner()))
                .requestedPrice(entity.getRequestedPrice())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .status(entity.getStatus())
                .expiredAt(entity.getExpiredAt())
                .createdAt(entity.getCreatedAt())
                .rentalStatus(rentalStatusVal)
                .rentalId(rentalIdVal)
                .build();
    }
}
