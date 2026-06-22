package com.ioc.internship.common.base;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@MappedSuperclass // Annotation bắt buộc để các Entity con kế thừa các trường này thành các cột trong DB
@Getter
@Setter
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Tương ứng với kiểu SERIAL (tự tăng) trong PostgreSQL
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @CreationTimestamp // Tự động điền thời gian hệ thống khi bản ghi được TẠO MỚI
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @UpdateTimestamp // Tự động CẬP NHẬT thời gian hệ thống mỗi khi bản ghi bị SỬA ĐỔI
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;
}