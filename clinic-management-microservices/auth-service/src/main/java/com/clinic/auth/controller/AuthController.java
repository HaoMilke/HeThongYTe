package com.clinic.auth.controller;

import com.clinic.auth.dto.AuthResponse;
import com.clinic.auth.dto.ChangePasswordRequest;
import com.clinic.auth.dto.LoginRequest;
import com.clinic.auth.dto.RefreshTokenRequest;
import com.clinic.auth.dto.RegisterRequest;

import com.clinic.auth.entity.RoleName;
import com.clinic.auth.entity.User;

import com.clinic.auth.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(
            AuthService authService
    ) {
        this.authService = authService;
    }

    @GetMapping("/test")
    public ResponseEntity<?> testAuthentication() {

        return ResponseEntity.ok(
                "JWT hợp lệ - truy cập thành công"
        );
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {
        try {

            User user =
                    authService.registerPatient(
                            request
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            "Đăng ký thành công. User ID: "
                                    + user.getId()
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {
        try {

            AuthResponse response =
                    authService.login(
                            request
                    );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(
                            HttpStatus.UNAUTHORIZED
                    )
                    .body(e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @RequestBody RefreshTokenRequest request
    ) {
        try {

            return ResponseEntity.ok(
                    authService.refresh(
                            request.getRefreshToken()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(
                            HttpStatus.UNAUTHORIZED
                    )
                    .body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestBody RefreshTokenRequest request
    ) {
        try {

            authService.logout(
                    request.getRefreshToken()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Đăng xuất thành công"
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(
            Authentication authentication
    ) {
        try {

            if (authentication == null
                    || !authentication.isAuthenticated()) {

                return ResponseEntity
                        .status(
                                HttpStatus.UNAUTHORIZED
                        )
                        .body("Chưa đăng nhập");
            }

            return ResponseEntity.ok(
                    authService.getCurrentUser(
                            authentication.getName()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PatchMapping("/change-password")
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request
    ) {
        try {

            if (authentication == null
                    || !authentication.isAuthenticated()) {

                return ResponseEntity
                        .status(
                                HttpStatus.UNAUTHORIZED
                        )
                        .body("Chưa đăng nhập");
            }

            return ResponseEntity.ok(
                    authService.changePassword(
                            authentication.getName(),
                            request
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {

        return ResponseEntity.ok(
                authService.getAllUsers()
        );
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUser(
            @PathVariable Long userId
    ) {
        try {

            return ResponseEntity.ok(
                    authService.getUserById(
                            userId
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PatchMapping("/users/{userId}/enabled")
    public ResponseEntity<?> setEnabled(
            @PathVariable Long userId,
            @RequestParam boolean enabled
    ) {
        try {

            return ResponseEntity.ok(
                    authService.setUserEnabled(
                            userId,
                            enabled
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PostMapping("/users/{userId}/roles/{roleName}")
    public ResponseEntity<?> addRole(
            @PathVariable Long userId,
            @PathVariable RoleName roleName
    ) {
        try {

            return ResponseEntity.ok(
                    authService.addRole(
                            userId,
                            roleName
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/users/{userId}/roles/{roleName}")
    public ResponseEntity<?> removeRole(
            @PathVariable Long userId,
            @PathVariable RoleName roleName
    ) {
        try {

            return ResponseEntity.ok(
                    authService.removeRole(
                            userId,
                            roleName
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PatchMapping("/users/{userId}/reset-password")
    public ResponseEntity<?> resetPassword(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request
    ) {
        try {

            String newPassword =
                    request.get(
                            "newPassword"
                    );

            return ResponseEntity.ok(
                    authService.resetPassword(
                            userId,
                            newPassword
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}