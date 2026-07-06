package com.ioc.internship.dto.response;

import com.ioc.internship.entity.RentalStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RentalPaymentInfoResponse {
    private Long rentalId;
    private BigDecimal totalPrice;
    private BigDecimal depositAmount;
    private String bankAccountNumber;   // của owner
    private String bankCode;            // của owner
    private String bankAccountHolderName; // của owner
    private String paymentContent;      // vd "RH" + rentalId, dùng làm nội dung CK
    private RentalStatus status;
}
