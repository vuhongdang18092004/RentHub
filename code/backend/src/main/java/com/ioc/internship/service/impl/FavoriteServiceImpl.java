package com.ioc.internship.service.impl;

import com.ioc.internship.dto.request.FavoriteRequest;
import com.ioc.internship.dto.response.FavoriteResponse;
import com.ioc.internship.entity.Favorite;
import com.ioc.internship.entity.Product;
import com.ioc.internship.entity.ProductImage;
import com.ioc.internship.entity.ProductStatus;
import com.ioc.internship.entity.UserEntity;
import com.ioc.internship.repository.FavoriteRepository;
import com.ioc.internship.repository.ProductRepository;
import com.ioc.internship.repository.UserRepository;
import com.ioc.internship.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void addFavorite(String email, FavoriteRequest request) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy người dùng"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));

        if (favoriteRepository.existsByUserAndProduct(user, product)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sản phẩm đã nằm trong danh sách yêu thích");
        }

        Favorite favorite = Favorite.builder()
                .user(user)
                .product(product)
                .build();
        
        favoriteRepository.save(favorite);
    }

    @Override
    public Page<FavoriteResponse> getMyFavorites(String email, Pageable pageable) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy người dùng"));

        return favoriteRepository.findByUser(user, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void removeFavorite(String email, Long productId) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy người dùng"));

        Favorite favorite = favoriteRepository.findByUserAndProduct_Id(user, productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sản phẩm không có trong danh sách yêu thích"));

        favoriteRepository.delete(favorite);
    }

    private FavoriteResponse mapToResponse(Favorite favorite) {
        Product product = favorite.getProduct();
        
        String thumbnail = null;
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            thumbnail = product.getImages().stream()
                    .filter(img -> img.getIsPrimary() != null && img.getIsPrimary())
                    .findFirst()
                    .map(ProductImage::getImageUrl)
                    .orElse(product.getImages().get(0).getImageUrl());
        }

        String statusMessage = null;
        if (product.getStatus() == ProductStatus.UNAVAILABLE) {
            statusMessage = "Sản phẩm này hiện đã ngừng cho thuê";
        }

        return FavoriteResponse.builder()
                .favoriteId(favorite.getId())
                .productId(product.getId())
                .productName(product.getName())
                .thumbnail(thumbnail)
                .rentalPrice(product.getPricePerDay())
                .productStatus(product.getStatus().name())
                .productStatusMessage(statusMessage)
                .createdAt(favorite.getCreatedAt())
                .build();
    }
}
