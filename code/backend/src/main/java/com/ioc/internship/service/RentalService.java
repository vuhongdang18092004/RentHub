package com.ioc.internship.service;

import com.ioc.internship.dto.response.RentalDetailResponse;
import com.ioc.internship.dto.response.RentalLifecycleResponse;

public interface RentalService {
    RentalLifecycleResponse handoverRental(String email, Long rentalId);
    RentalLifecycleResponse receiveRental(String email, Long rentalId);
    RentalLifecycleResponse rejectRental(String email, Long rentalId);
    RentalLifecycleResponse returnRental(String email, Long rentalId);
    RentalLifecycleResponse completeRental(String email, Long rentalId);
    
    RentalDetailResponse getRentalDetail(String email, Long rentalId);
    
    void adminCancelRental(Long rentalId);
    void adminCompleteRental(Long rentalId);
}
