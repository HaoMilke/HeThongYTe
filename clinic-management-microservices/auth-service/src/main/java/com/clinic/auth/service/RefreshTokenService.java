package com.clinic.auth.service;

import com.clinic.auth.entity.RefreshToken;
import com.clinic.auth.entity.User;
import com.clinic.auth.repository.RefreshTokenRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository
    ) {
        this.refreshTokenRepository =
                refreshTokenRepository;
    }

    @Transactional
    public RefreshToken createRefreshToken(
            User user
    ) {
        /*
         * Mỗi user chỉ giữ một refresh token hoạt động.
         * Login lại sẽ thay token cũ.
         */
        refreshTokenRepository.deleteByUser(
                user
        );

        RefreshToken refreshToken =
                new RefreshToken();

        refreshToken.setToken(
                UUID.randomUUID().toString()
                        + UUID.randomUUID()
        );

        refreshToken.setUser(
                user
        );

        refreshToken.setExpiryDate(
                LocalDateTime.now()
                        .plusSeconds(
                                refreshExpiration / 1000
                        )
        );

        refreshToken.setRevoked(
                false
        );

        return refreshTokenRepository.save(
                refreshToken
        );
    }

    public RefreshToken verify(
            String token
    ) {
        RefreshToken refreshToken =
                refreshTokenRepository
                        .findByToken(token)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Refresh token không hợp lệ"
                                )
                        );

        if (Boolean.TRUE.equals(
                refreshToken.getRevoked()
        )) {
            throw new RuntimeException(
                    "Refresh token đã bị thu hồi"
            );
        }

        if (refreshToken.getExpiryDate()
                .isBefore(LocalDateTime.now())) {

            refreshTokenRepository.delete(
                    refreshToken
            );

            throw new RuntimeException(
                    "Refresh token đã hết hạn"
            );
        }

        if (!Boolean.TRUE.equals(
                refreshToken.getUser().getEnabled()
        )) {
            throw new RuntimeException(
                    "Tài khoản đã bị khóa"
            );
        }

        return refreshToken;
    }

    @Transactional
    public void revoke(
            String token
    ) {
        RefreshToken refreshToken =
                refreshTokenRepository
                        .findByToken(token)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Refresh token không hợp lệ"
                                )
                        );

        refreshToken.setRevoked(true);

        refreshTokenRepository.save(
                refreshToken
        );
    }
}