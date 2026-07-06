package com.ioc.internship.service.impl;

import com.ioc.internship.dto.request.CreateRentalRequest;
import com.ioc.internship.dto.request.UpdateRentalRequest;
import com.ioc.internship.dto.response.RentalRequestDetailResponse;
import com.ioc.internship.dto.response.RentalRequestSummaryResponse;
import com.ioc.internship.entity.*;
import com.ioc.internship.repository.ProductRepository;
import com.ioc.internship.repository.RentalRepository;
import com.ioc.internship.repository.RentalRequestRepository;
import com.ioc.internship.repository.UserRepository;
import com.ioc.internship.service.RentalRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class RentalRequestServiceImpl implements RentalRequestService {

    private final RentalRequestRepository rentalRequestRepository;
    private final RentalRepository rentalRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    @Transactional
    public RentalRequestDetailResponse createRentalRequest(String email, CreateRentalRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new RuntimeException("400 Bad Request: Start date must be before or equal to end date");
        }

        UserEntity renter = getUserByEmail(email);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getStatus().equals(ProductStatus.AVAILABLE)) {
            throw new RuntimeException("400 Bad Request: Product is not available for rent");
        }

        if (product.getOwner().getId().equals(renter.getId())) {
            throw new RuntimeException("400 Bad Request: Cannot rent your own product");
        }

        boolean hasPending = rentalRequestRepository.existsByRenterIdAndProductIdAndStatus(renter.getId(), product.getId(), RequestStatus.PENDING);
        if (hasPending) {
            throw new RuntimeException("400 Bad Request: You already have a pending rental request for this product. Please cancel it or wait for the owner's response.");
        }

        RentalRequest rentalRequest = RentalRequest.builder()
                .product(product)
                .renter(renter)
                .owner(product.getOwner())
                .requestedPrice(product.getPricePerDay())
                .requestedDeposit(product.getDepositAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .expiredAt(LocalDateTime.now().plusHours(24))
                .message(request.getMessage())
                .status(RequestStatus.PENDING)
                .build();

        return RentalRequestDetailResponse.fromEntity(rentalRequestRepository.save(rentalRequest));
    }

    @Override
    @Transactional
    public RentalRequestDetailResponse updateRentalRequest(String email, Long requestId, UpdateRentalRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new RuntimeException("400 Bad Request: Start date must be before or equal to end date");
        }

        UserEntity renter = getUserByEmail(email);
        RentalRequest rentalRequest = rentalRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Rental request not found"));

        if (!rentalRequest.getRenter().getId().equals(renter.getId())) {
            throw new RuntimeException("403 Forbidden: Not your request");
        }

        if (!rentalRequest.getStatus().equals(RequestStatus.PENDING) || rentalRequest.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("400 Bad Request: Request cannot be updated (not pending or expired)");
        }

        rentalRequest.setStartDate(request.getStartDate());
        rentalRequest.setEndDate(request.getEndDate());
        rentalRequest.setMessage(request.getMessage());

        return RentalRequestDetailResponse.fromEntity(rentalRequestRepository.save(rentalRequest));
    }

    @Override
    @Transactional
    public void cancelRentalRequest(String email, Long requestId) {
        UserEntity renter = getUserByEmail(email);
        RentalRequest rentalRequest = rentalRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Rental request not found"));

        if (!rentalRequest.getRenter().getId().equals(renter.getId())) {
            throw new RuntimeException("403 Forbidden: Not your request");
        }

        if (!rentalRequest.getStatus().equals(RequestStatus.PENDING) || rentalRequest.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("400 Bad Request: Request cannot be cancelled (not pending or expired)");
        }

        rentalRequest.setStatus(RequestStatus.CANCELLED);
        rentalRequestRepository.save(rentalRequest);
    }

    @Override
    public Page<RentalRequestSummaryResponse> getMyRentalRequests(String email, RequestStatus status, int page, int size) {
        UserEntity renter = getUserByEmail(email);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Page<RentalRequest> requests;
        if (status != null) {
            requests = rentalRequestRepository.findByRenterIdAndStatus(renter.getId(), status, pageable);
        } else {
            requests = rentalRequestRepository.findByRenterId(renter.getId(), pageable);
        }
        return requests.map(RentalRequestSummaryResponse::fromEntity);
    }

    @Override
    public RentalRequestDetailResponse getMyRentalRequestDetail(String email, Long requestId) {
        UserEntity renter = getUserByEmail(email);
        RentalRequest request = rentalRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Rental request not found"));
        if (!request.getRenter().getId().equals(renter.getId())) {
            throw new RuntimeException("403 Forbidden: Not your request");
        }
        return RentalRequestDetailResponse.fromEntity(request);
    }

    @Override
    public Page<RentalRequestSummaryResponse> getOwnerRentalRequests(String email, RequestStatus status, Long productId, String keyword, String sort, int page, int size) {
        UserEntity owner = getUserByEmail(email);
        
        Sort sortObj = Sort.by(Sort.Direction.DESC, "createdAt"); // default newest
        if ("oldest".equalsIgnoreCase(sort)) {
            sortObj = Sort.by(Sort.Direction.ASC, "createdAt");
        } else if ("startDateAsc".equalsIgnoreCase(sort)) {
            sortObj = Sort.by(Sort.Direction.ASC, "startDate");
        } else if ("startDateDesc".equalsIgnoreCase(sort)) {
            sortObj = Sort.by(Sort.Direction.DESC, "startDate");
        }
        
        Pageable pageable = PageRequest.of(page, size, sortObj);

        org.springframework.data.jpa.domain.Specification<RentalRequest> spec = 
                com.ioc.internship.repository.specification.RentalRequestSpecification.buildOwnerFilters(
                        owner.getId(), keyword, productId, status);

        return rentalRequestRepository.findAll(spec, pageable)
                .map(RentalRequestSummaryResponse::fromEntity);
    }

    @Override
    public com.ioc.internship.dto.response.RentalRequestStatisticsResponse getOwnerRentalRequestStatistics(String email) {
        UserEntity owner = getUserByEmail(email);
        java.util.List<Object[]> stats = rentalRequestRepository.countRequestsByStatusForOwner(owner.getId());
        
        long total = 0, pending = 0, approved = 0, rejected = 0, cancelled = 0, expired = 0;
        
        for (Object[] row : stats) {
            RequestStatus status = (RequestStatus) row[0];
            long count = ((Number) row[1]).longValue();
            total += count;
            switch (status) {
                case PENDING: pending = count; break;
                case APPROVED: approved = count; break;
                case REJECTED: rejected = count; break;
                case CANCELLED: cancelled = count; break;
                case EXPIRED: expired = count; break;
            }
        }
        
        return com.ioc.internship.dto.response.RentalRequestStatisticsResponse.builder()
                .total(total)
                .pending(pending)
                .approved(approved)
                .rejected(rejected)
                .cancelled(cancelled)
                .expired(expired)
                .build();
    }

    @Override
    public RentalRequestDetailResponse getOwnerRentalRequestDetail(String email, Long requestId) {
        UserEntity owner = getUserByEmail(email);
        RentalRequest request = rentalRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Rental request not found"));
        if (!request.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("403 Forbidden: Not your request");
        }
        return RentalRequestDetailResponse.fromEntity(request);
    }

    @Override
    @Transactional
    public void approveRentalRequest(String email, Long requestId) {
        UserEntity owner = getUserByEmail(email);

        if (owner.getBankAccountNumber() == null || owner.getBankCode() == null || owner.getBankAccountHolderName() == null) {
            throw new RuntimeException("400 Bad Request: Vui lòng cập nhật tài khoản ngân hàng trước khi duyệt yêu cầu thuê");
        }
        
        RentalRequest rentalRequest = rentalRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Rental request not found"));

        if (!rentalRequest.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("403 Forbidden: Not your product");
        }

        if (!rentalRequest.getStatus().equals(RequestStatus.PENDING) || rentalRequest.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("400 Bad Request: Request is not pending or has expired");
        }

        // PESSIMISTIC_WRITE lock on Product to prevent race conditions across different requests for the same product
        Product product = productRepository.findByIdForUpdate(rentalRequest.getProduct().getId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
                
        if (!product.getStatus().equals(ProductStatus.AVAILABLE)) {
            throw new RuntimeException("400 Bad Request: Product is no longer available");
        }

        LocalDate requestStart = rentalRequest.getStartDate().minusDays(1);
        LocalDate requestEnd = rentalRequest.getEndDate().plusDays(1);

        boolean conflict = rentalRepository.existsConflictingRental(product.getId(), requestStart, requestEnd);
        if (conflict) {
            throw new RuntimeException("400 Bad Request: Product already has an approved rental during this period");
        }

        rentalRequest.setStatus(RequestStatus.APPROVED);
        rentalRequestRepository.save(rentalRequest);

        long days = ChronoUnit.DAYS.between(rentalRequest.getStartDate(), rentalRequest.getEndDate());
        BigDecimal total = rentalRequest.getRequestedPrice().multiply(BigDecimal.valueOf(days)).add(rentalRequest.getRequestedDeposit());

        Rental rental = Rental.builder()
                .request(rentalRequest)
                .product(product)
                .renter(rentalRequest.getRenter())
                .owner(owner)
                .startDate(rentalRequest.getStartDate())
                .endDate(rentalRequest.getEndDate())
                .rentalDays((int) days)
                .pricePerDay(rentalRequest.getRequestedPrice())
                .depositAmount(rentalRequest.getRequestedDeposit())
                .totalPrice(total)
                .status(RentalStatus.WAITING_PAYMENT)
                .build();

        rentalRepository.save(rental);
    }

    @Override
    @Transactional
    public void rejectRentalRequest(String email, Long requestId) {
        UserEntity owner = getUserByEmail(email);
        RentalRequest rentalRequest = rentalRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Rental request not found"));

        if (!rentalRequest.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("403 Forbidden: Not your request");
        }

        if (!rentalRequest.getStatus().equals(RequestStatus.PENDING) || rentalRequest.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("400 Bad Request: Request cannot be rejected (not pending or expired)");
        }

        rentalRequest.setStatus(RequestStatus.REJECTED);
        rentalRequestRepository.save(rentalRequest);
    }

    @Override
    @Transactional
    public void cancelRentalAsOwner(String email, Long rentalId) {
        UserEntity owner = getUserByEmail(email);
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental not found"));

        if (!rental.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("403 Forbidden: Not your rental");
        }

        if (!rental.getStatus().equals(RentalStatus.WAITING_PAYMENT)) {
            throw new RuntimeException("400 Bad Request: Cannot cancel rental unless it is WAITING_PAYMENT");
        }

        rental.setStatus(RentalStatus.CANCELLED);
        rentalRepository.save(rental);
    }

    @Override
    public com.ioc.internship.dto.response.RentalPaymentInfoResponse getRentalPaymentInfo(String email, Long rentalId) {
        UserEntity renter = getUserByEmail(email);
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental not found"));

        if (!rental.getRenter().getId().equals(renter.getId())) {
            throw new RuntimeException("403 Forbidden: Not your rental");
        }
        if (!rental.getStatus().equals(RentalStatus.WAITING_PAYMENT)) {
            throw new RuntimeException("400 Bad Request: Rental is not waiting for payment");
        }

        UserEntity owner = rental.getOwner();
        if (owner.getBankAccountNumber() == null || owner.getBankCode() == null || owner.getBankAccountHolderName() == null) {
            throw new RuntimeException("400 Bad Request: Chủ đồ chưa cập nhật tài khoản ngân hàng nhận tiền");
        }

        return com.ioc.internship.dto.response.RentalPaymentInfoResponse.builder()
                .rentalId(rental.getId())
                .totalPrice(rental.getTotalPrice())
                .depositAmount(rental.getDepositAmount())
                .bankAccountNumber(owner.getBankAccountNumber())
                .bankCode(owner.getBankCode())
                .bankAccountHolderName(owner.getBankAccountHolderName())
                .paymentContent("RH" + rental.getId())
                .status(rental.getStatus())
                .build();
    }

    @Override
    @Transactional
    public void confirmRentalPayment(String email, Long rentalId) {
        UserEntity renter = getUserByEmail(email);
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental not found"));

        if (!rental.getRenter().getId().equals(renter.getId())) {
            throw new RuntimeException("403 Forbidden: Not your rental");
        }
        if (!rental.getStatus().equals(RentalStatus.WAITING_PAYMENT)) {
            throw new RuntimeException("400 Bad Request: Rental is not waiting for payment");
        }

        rental.setStatus(RentalStatus.ACTIVE);
        rentalRepository.save(rental);
    }
}
