package com.ioc.internship.service.impl;

import com.ioc.internship.dto.request.UserStatusUpdateRequest;
import com.ioc.internship.dto.request.UserUpdateRequest;
import com.ioc.internship.dto.response.UserResponse;
import com.ioc.internship.entity.UserEntity;
import com.ioc.internship.repository.UserRepository;
import com.ioc.internship.service.UserService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse getMyProfile(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        return mapToResponse(user);
    }

    @Override
    public UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
    }

    @Override
    @Transactional
    public UserResponse updateMyProfile(String email, UserUpdateRequest request) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));

        // Validate latitude/longitude together
        if ((request.getLatitude() != null && request.getLongitude() == null) ||
                (request.getLatitude() == null && request.getLongitude() != null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Latitude và Longitude phải được truyền cùng nhau");
        }

        // Validate phone uniqueness
        if (userRepository.existsByPhoneAndIdNot(request.getPhone(), user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số điện thoại đã tồn tại");
        }

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setAddress(request.getAddress());
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        user.setBankAccountNumber(request.getBankAccountNumber());
        user.setBankCode(request.getBankCode());
        user.setBankAccountHolderName(request.getBankAccountHolderName());
        user.setUpdatedAt(LocalDateTime.now());

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    @Override
    public Page<UserResponse> getAllUsersForAdmin(String keyword, String role, String status, Pageable pageable) {
        Specification<UserEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (keyword != null && !keyword.trim().isEmpty()) {
                String likeKeyword = "%" + keyword.toLowerCase() + "%";
                Predicate fullNamePredicate = cb.like(cb.lower(root.get("fullName")), likeKeyword);
                Predicate emailPredicate = cb.like(cb.lower(root.get("email")), likeKeyword);
                Predicate phonePredicate = cb.like(cb.lower(root.get("phone")), likeKeyword);
                predicates.add(cb.or(fullNamePredicate, emailPredicate, phonePredicate));
            }
            if (role != null && !role.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("role"), role));
            }
            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return userRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Override
    public UserResponse getUserDetailForAdmin(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUserStatusByAdmin(Long id, UserStatusUpdateRequest request, String adminEmail) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));

        if (user.getEmail().equals(adminEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin không thể tự thay đổi trạng thái của chính mình");
        }

        user.setStatus(request.getStatus());
        user.setUpdatedAt(LocalDateTime.now());

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    private UserResponse mapToResponse(UserEntity entity) {
        return UserResponse.builder()
                .id(entity.getId())
                .fullName(entity.getFullName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .avatarUrl(entity.getAvatarUrl())
                .address(entity.getAddress())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .role(entity.getRole())
                .status(entity.getStatus())
                .bankAccountNumber(entity.getBankAccountNumber())
                .bankCode(entity.getBankCode())
                .bankAccountHolderName(entity.getBankAccountHolderName())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
