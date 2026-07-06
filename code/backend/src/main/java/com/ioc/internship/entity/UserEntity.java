package com.ioc.internship.entity;

import com.ioc.internship.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity extends BaseEntity implements UserDetails {

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "phone", unique = true)
    private String phone;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "address")
    private String address;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "role")
    private String role; // Sẽ lưu giá trị chuỗi như 'ROLE_USER' hoặc 'ROLE_ADMIN'

    @Column(name = "status")
    private String status; // 'ACTIVE' / 'PENDING' / 'BLOCKED'

    @Column(name = "bank_account_number")
    private String bankAccountNumber;

    @Column(name = "bank_code")
    private String bankCode;

    @Column(name = "bank_account_holder_name")
    private String bankAccountHolderName;

    // CÁC HÀM BẮT BUỘC ĐỂ TRIỂN KHAI INTERFACE USERDETAILS (SPRING SECURITY)
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Chuyển đổi chuỗi role (VD: "ROLE_USER") thành đối tượng Spring Security hiểu được
        return List.of(new SimpleGrantedAuthority(this.role));
    }

    @Override
    public String getUsername() {
        // Dự án RentHub dùng email làm tài khoản đăng nhập
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Tài khoản không bao giờ hết hạn
    }

    @Override
    public boolean isAccountNonLocked() {
        // Nếu status là 'BLOCKED' thì trả về false (khóa tài khoản)
        return !"BLOCKED".equals(this.status);
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Mật khẩu/Chứng chỉ không hết hạn
    }

    @Override
    public boolean isEnabled() {
        // Chỉ cho phép đăng nhập nếu trạng thái là ACTIVE
        return "ACTIVE".equals(this.status);
    }
}