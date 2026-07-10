package com.ioc.internship.entity;

public enum PaymentType {
    DEPOSIT,
    RENTAL_PAYMENT,
    RENTAL_FEE, // keeping for backward compatibility with old DB rows
    REFUND,
    REFUND_DEPOSIT, // keeping for backward compatibility
    REFUND_CANCEL // keeping for backward compatibility
}
