package com.ioc.internship.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SepayWebhookRequest {
    private Long id;
    private String gateway;
    private String transactionDate;
    private String accountNumber;
    private String subAccount;
    private String transferType;
    private Double transferAmount;
    private Double accumulated;
    private String code;

    // SePay gửi field tên "content" nhưng Java convention là camelCase
    @JsonProperty("content")
    private String transactionContent;

    // SePay gửi "referenceCode" không phải "referenceNumber"
    @JsonProperty("referenceCode")
    private String referenceNumber;

    // SePay cũng có thể gửi thêm "description"
    private String description;
}
