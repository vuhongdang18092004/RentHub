package com.ioc.internship.controller;

import com.ioc.internship.dto.request.FavoriteRequest;
import com.ioc.internship.dto.response.FavoriteResponse;
import com.ioc.internship.service.FavoriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping
    public ResponseEntity<Void> addFavorite(Authentication authentication, @Valid @RequestBody FavoriteRequest request) {
        favoriteService.addFavorite(authentication.getName(), request);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<FavoriteResponse>> getMyFavorites(Authentication authentication,
                                                                 @RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(favoriteService.getMyFavorites(authentication.getName(), pageable));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFavorite(Authentication authentication, @PathVariable Long productId) {
        favoriteService.removeFavorite(authentication.getName(), productId);
        return ResponseEntity.noContent().build();
    }
}
