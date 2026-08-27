package com.clinic.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Service
public class GatewayJwtService {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {

        byte[] keyBytes =
                secret.getBytes(
                        StandardCharsets.UTF_8
                );

        return Keys.hmacShaKeyFor(
                keyBytes
        );
    }

    public Claims parseToken(
            String token
    ) {

        return Jwts.parser()
                .verifyWith(
                        getSigningKey()
                )
                .build()
                .parseSignedClaims(
                        token
                )
                .getPayload();
    }

    public boolean isTokenValid(
            String token
    ) {

        try {

            Claims claims =
                    parseToken(token);

            Date expiration =
                    claims.getExpiration();

            return expiration != null
                    && expiration.after(
                            new Date()
                    );

        } catch (Exception e) {

            return false;
        }
    }

    public String extractEmail(
            String token
    ) {

        return parseToken(token)
                .getSubject();
    }

    public Long extractUserId(
            String token
    ) {

        Object userId =
                parseToken(token)
                        .get("userId");

        if (userId == null) {
            return null;
        }

        if (userId instanceof Number number) {
            return number.longValue();
        }

        return Long.valueOf(
                userId.toString()
        );
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(
            String token
    ) {

        Object roles =
                parseToken(token)
                        .get("roles");

        if (roles == null) {
            return List.of();
        }

        return ((List<Object>) roles)
                .stream()
                .map(Object::toString)
                .toList();
    }
}