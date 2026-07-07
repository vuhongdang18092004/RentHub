package com.ioc.internship.dto.response;

import com.ioc.internship.entity.RentalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RentalLifecycleResponse {
    private Long rentalId;
    private RentalStatus status;
    private String message;
}
