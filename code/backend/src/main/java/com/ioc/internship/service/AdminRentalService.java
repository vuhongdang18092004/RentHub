package com.ioc.internship.service;

import com.ioc.internship.dto.response.RentalDetailResponse;
import com.ioc.internship.dto.response.ProductSummaryResponse;
import com.ioc.internship.dto.response.UserSummaryResponse;
import com.ioc.internship.entity.Rental;
import com.ioc.internship.entity.RentalStatus;
import com.ioc.internship.repository.RentalRepository;
import com.ioc.internship.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminRentalService {
    private final RentalRepository rentalRepository;
    private final ReviewRepository reviewRepository;
    private final AuditLogService auditLogService;

    public Page<RentalDetailResponse> getAllRentals(Pageable pageable) {
        return rentalRepository.findAll(pageable).map(this::convertToDto);
    }

    @Transactional
    public RentalDetailResponse cancelRental(Long adminId, Long id) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rental not found"));
        
        String oldStatus = rental.getStatus().name();
        rental.setStatus(RentalStatus.CANCELLED);
        Rental saved = rentalRepository.save(rental);
        
        auditLogService.log(adminId, "CANCEL_RENTAL", "Rental", id, oldStatus, "CANCELLED");
        
        return convertToDto(saved);
    }

    private RentalDetailResponse convertToDto(Rental rental) {
        boolean reviewed = reviewRepository.existsByRentalId(rental.getId());
        return RentalDetailResponse.builder()
                .id(rental.getId())
                .product(ProductSummaryResponse.fromEntity(rental.getProduct()))
                .owner(UserSummaryResponse.fromEntity(rental.getOwner()))
                .renter(UserSummaryResponse.fromEntity(rental.getRenter()))
                .startDate(rental.getStartDate())
                .endDate(rental.getEndDate())
                .rentalDays(rental.getRentalDays())
                .pricePerDay(rental.getPricePerDay())
                .depositAmount(rental.getDepositAmount())
                .totalPrice(rental.getTotalPrice())
                .status(rental.getStatus())
                .createdAt(rental.getCreatedAt())
                .updatedAt(rental.getUpdatedAt())
                .reviewed(reviewed)
                .canReview(false)
                .build();
    }
}
