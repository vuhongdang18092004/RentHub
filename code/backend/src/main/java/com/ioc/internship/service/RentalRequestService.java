package com.ioc.internship.service;

import com.ioc.internship.dto.request.CreateRentalRequest;
import com.ioc.internship.dto.request.UpdateRentalRequest;
import com.ioc.internship.dto.response.RentalRequestDetailResponse;
import com.ioc.internship.dto.response.RentalRequestSummaryResponse;
import com.ioc.internship.entity.RequestStatus;
import org.springframework.data.domain.Page;

public interface RentalRequestService {

    // Renter
    RentalRequestDetailResponse createRentalRequest(String email, CreateRentalRequest request);

    RentalRequestDetailResponse updateRentalRequest(String email, Long requestId, UpdateRentalRequest request);

    void cancelRentalRequest(String email, Long requestId);

    Page<RentalRequestSummaryResponse> getMyRentalRequests(String email, RequestStatus status, int page, int size);

    RentalRequestDetailResponse getMyRentalRequestDetail(String email, Long requestId);

    // Owner
    Page<RentalRequestSummaryResponse> getOwnerRentalRequests(String email, RequestStatus status, Long productId, String keyword, String sort, int page, int size);

    RentalRequestDetailResponse getOwnerRentalRequestDetail(String email, Long requestId);

    com.ioc.internship.dto.response.RentalRequestStatisticsResponse getOwnerRentalRequestStatistics(String email);

    void approveRentalRequest(String email, Long requestId);

    void rejectRentalRequest(String email, Long requestId);

    void cancelRentalAsOwner(String email, Long rentalId);

    com.ioc.internship.dto.response.RentalPaymentInfoResponse getRentalPaymentInfo(String email, Long rentalId);

    void confirmRentalPayment(String email, Long rentalId);

    void requestReturn(String email, Long rentalId);

    void confirmReturn(String email, Long rentalId);
}
