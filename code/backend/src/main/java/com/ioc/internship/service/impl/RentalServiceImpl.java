package com.ioc.internship.service.impl;

import com.ioc.internship.dto.response.RentalLifecycleResponse;
import com.ioc.internship.entity.*;
import com.ioc.internship.repository.PaymentRepository;
import com.ioc.internship.repository.ProductRepository;
import com.ioc.internship.repository.RentalRepository;
import com.ioc.internship.repository.ReportRepository;
import com.ioc.internship.repository.UserRepository;
import com.ioc.internship.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RentalServiceImpl implements RentalService {

    private final RentalRepository rentalRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;

    private UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("404 Not Found: User not found"));
    }

    private void validateRentalNotLocked(Rental rental) {
        long unresolvedCount = reportRepository.countByRentalAndStatusIn(rental, 
            List.of(ReportStatus.PENDING, ReportStatus.UNDER_REVIEW));
        if (unresolvedCount > 0) {
            throw new RuntimeException("400 Bad Request: Rental is locked due to an unresolved report");
        }
    }

    @Override
    @Transactional
    public RentalLifecycleResponse handoverRental(String email, Long rentalId) {
        UserEntity owner = getUserByEmail(email);
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Rental not found"));

        validateRentalNotLocked(rental);

        if (!rental.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("403 Forbidden: Not your product");
        }
        
        if (!rental.getStatus().equals(RentalStatus.WAITING_PAYMENT)) {
            throw new RuntimeException("400 Bad Request: Rental is not WAITING_PAYMENT");
        }

        // Must have at least one successful payment
        boolean hasPayment = paymentRepository.existsByRentalAndStatus(rental, PaymentStatus.SUCCESS);
        if (!hasPayment) {
            throw new RuntimeException("400 Bad Request: Cannot handover without a successful payment");
        }

        rental.setStatus(RentalStatus.HANDOVER_PENDING);
        rentalRepository.save(rental);

        return RentalLifecycleResponse.builder()
                .rentalId(rental.getId())
                .status(rental.getStatus())
                .message("Handover successful. Rental is now HANDOVER_PENDING.")
                .build();
    }

    @Override
    @Transactional
    public RentalLifecycleResponse receiveRental(String email, Long rentalId) {
        UserEntity renter = getUserByEmail(email);
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Rental not found"));

        validateRentalNotLocked(rental);

        if (!rental.getRenter().getId().equals(renter.getId())) {
            throw new RuntimeException("403 Forbidden: Not your rental");
        }

        if (!rental.getStatus().equals(RentalStatus.HANDOVER_PENDING)) {
            throw new RuntimeException("400 Bad Request: Rental is not HANDOVER_PENDING");
        }

        rental.setStatus(RentalStatus.ACTIVE);
        rentalRepository.save(rental);

        return RentalLifecycleResponse.builder()
                .rentalId(rental.getId())
                .status(rental.getStatus())
                .message("Received successfully. Rental is now ACTIVE.")
                .build();
    }

    @Override
    @Transactional
    public RentalLifecycleResponse rejectRental(String email, Long rentalId) {
        UserEntity renter = getUserByEmail(email);
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Rental not found"));

        validateRentalNotLocked(rental);

        if (!rental.getRenter().getId().equals(renter.getId())) {
            throw new RuntimeException("403 Forbidden: Not your rental");
        }

        if (!rental.getStatus().equals(RentalStatus.HANDOVER_PENDING)) {
            throw new RuntimeException("400 Bad Request: Rental is not HANDOVER_PENDING");
        }

        // Create Report
        Report report = new Report();
        report.setRental(rental);
        report.setProduct(rental.getProduct());
        report.setReporter(renter);
        report.setReportedUser(rental.getOwner());
        report.setReason(ReportReason.PRODUCT_NOT_AS_DESCRIBED);
        report.setDescription("Renter rejected the product during handover.");
        report.setStatus(ReportStatus.PENDING);
        reportRepository.save(report);

        // Status remains HANDOVER_PENDING

        return RentalLifecycleResponse.builder()
                .rentalId(rental.getId())
                .status(rental.getStatus())
                .message("Product rejected. A report has been created and Rental is now LOCKED.")
                .build();
    }

    @Override
    @Transactional
    public RentalLifecycleResponse returnRental(String email, Long rentalId) {
        UserEntity renter = getUserByEmail(email);
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Rental not found"));

        validateRentalNotLocked(rental);

        if (!rental.getRenter().getId().equals(renter.getId())) {
            throw new RuntimeException("403 Forbidden: Not your rental");
        }
        
        if (!rental.getStatus().equals(RentalStatus.ACTIVE)) {
            throw new RuntimeException("400 Bad Request: Rental is not ACTIVE");
        }

        rental.setStatus(RentalStatus.RETURN_PENDING);
        rentalRepository.save(rental);

        return RentalLifecycleResponse.builder()
                .rentalId(rental.getId())
                .status(rental.getStatus())
                .message("Return requested. Rental is now RETURN_PENDING.")
                .build();
    }

    @Override
    @Transactional
    public RentalLifecycleResponse completeRental(String email, Long rentalId) {
        UserEntity owner = getUserByEmail(email);
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Rental not found"));

        validateRentalNotLocked(rental);

        if (!rental.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("403 Forbidden: Not your product");
        }
        
        if (!rental.getStatus().equals(RentalStatus.RETURN_PENDING)) {
            throw new RuntimeException("400 Bad Request: Rental is not RETURN_PENDING");
        }

        rental.setStatus(RentalStatus.COMPLETED);
        rentalRepository.save(rental);

        Product product = rental.getProduct();
        product.setStatus(ProductStatus.AVAILABLE);
        productRepository.save(product);

        return RentalLifecycleResponse.builder()
                .rentalId(rental.getId())
                .status(rental.getStatus())
                .message("Return confirmed. Rental is now COMPLETED and Product is AVAILABLE.")
                .build();
    }

    @Override
    @Transactional
    public void adminCancelRental(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Rental not found"));
        rental.setStatus(RentalStatus.CANCELLED);
        rentalRepository.save(rental);

        Product product = rental.getProduct();
        product.setStatus(ProductStatus.AVAILABLE);
        productRepository.save(product);
    }

    @Override
    @Transactional
    public void adminCompleteRental(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Rental not found"));
        rental.setStatus(RentalStatus.COMPLETED);
        rentalRepository.save(rental);

        Product product = rental.getProduct();
        product.setStatus(ProductStatus.AVAILABLE);
        productRepository.save(product);
    }

    @Override
    public com.ioc.internship.dto.response.RentalDetailResponse getRentalDetail(String email, Long rentalId) {
        UserEntity user = getUserByEmail(email);
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Rental not found"));

        if (!rental.getOwner().getId().equals(user.getId()) && !rental.getRenter().getId().equals(user.getId())) {
            throw new RuntimeException("403 Forbidden: You are not a participant in this rental");
        }

        return com.ioc.internship.dto.response.RentalDetailResponse.builder()
                .id(rental.getId())
                .product(com.ioc.internship.dto.response.ProductSummaryResponse.fromEntity(rental.getProduct()))
                .owner(com.ioc.internship.dto.response.UserSummaryResponse.fromEntity(rental.getOwner()))
                .renter(com.ioc.internship.dto.response.UserSummaryResponse.fromEntity(rental.getRenter()))
                .startDate(rental.getStartDate())
                .endDate(rental.getEndDate())
                .rentalDays(rental.getRentalDays())
                .pricePerDay(rental.getPricePerDay())
                .depositAmount(rental.getDepositAmount())
                .totalPrice(rental.getTotalPrice())
                .status(rental.getStatus())
                .createdAt(rental.getCreatedAt())
                .updatedAt(rental.getUpdatedAt())
                .build();
    }
}
