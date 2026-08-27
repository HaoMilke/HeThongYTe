package com.clinic.auth.service;

import com.clinic.auth.dto.AuthResponse;
import com.clinic.auth.dto.ChangePasswordRequest;
import com.clinic.auth.dto.LoginRequest;
import com.clinic.auth.dto.RegisterRequest;
import com.clinic.auth.dto.UserProfileResponse;

import com.clinic.auth.entity.RefreshToken;
import com.clinic.auth.entity.Role;
import com.clinic.auth.entity.RoleName;
import com.clinic.auth.entity.User;

import com.clinic.auth.repository.RoleRepository;
import com.clinic.auth.repository.UserRepository;

import com.clinic.auth.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    public User registerPatient(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "Email đã tồn tại"
            );
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException(
                    "Số điện thoại đã tồn tại"
            );
        }

        Role patientRole =
                roleRepository
                        .findByName(RoleName.ROLE_PATIENT)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy ROLE_PATIENT"
                                )
                        );

        User user = new User();

        user.setFullName(
                request.getFullName()
        );

        user.setEmail(
                request.getEmail()
        );

        user.setPhone(
                request.getPhone()
        );

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setEnabled(true);

        user.getRoles().add(
                patientRole
        );

        return userRepository.save(
                user
        );
    }

    public AuthResponse login(
            LoginRequest request
    ) {

        User user =
                userRepository
                        .findByEmail(
                                request.getEmail()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Email hoặc mật khẩu không chính xác"
                                )
                        );

        if (!Boolean.TRUE.equals(
                user.getEnabled()
        )) {
            throw new RuntimeException(
                    "Tài khoản đã bị khóa"
            );
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException(
                    "Email hoặc mật khẩu không chính xác"
            );
        }

        String accessToken =
                jwtService.generateToken(
                        user
                );

        RefreshToken refreshToken =
                refreshTokenService
                        .createRefreshToken(
                                user
                        );

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                "Bearer",
                user.getId(),
                user.getEmail()
        );
    }

    public AuthResponse refresh(
            String refreshTokenValue
    ) {

        if (refreshTokenValue == null
                || refreshTokenValue.isBlank()) {
            throw new RuntimeException(
                    "Refresh token không được để trống"
            );
        }

        RefreshToken refreshToken =
                refreshTokenService.verify(
                        refreshTokenValue
                );

        User user =
                refreshToken.getUser();

        String newAccessToken =
                jwtService.generateToken(
                        user
                );

        return new AuthResponse(
                newAccessToken,
                refreshToken.getToken(),
                "Bearer",
                user.getId(),
                user.getEmail()
        );
    }

    public void logout(
            String refreshTokenValue
    ) {

        if (refreshTokenValue == null
                || refreshTokenValue.isBlank()) {
            throw new RuntimeException(
                    "Refresh token không được để trống"
            );
        }

        refreshTokenService.revoke(
                refreshTokenValue
        );
    }

    public UserProfileResponse getCurrentUser(
            String email
    ) {

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy người dùng"
                                )
                        );

        return toProfileResponse(
                user
        );
    }

    public UserProfileResponse changePassword(
            String email,
            ChangePasswordRequest request
    ) {

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy người dùng"
                                )
                        );

        if (request.getCurrentPassword() == null
                || request.getCurrentPassword().isBlank()) {
            throw new RuntimeException(
                    "Mật khẩu hiện tại không được để trống"
            );
        }

        if (request.getNewPassword() == null
                || request.getNewPassword().isBlank()) {
            throw new RuntimeException(
                    "Mật khẩu mới không được để trống"
            );
        }

        if (request.getNewPassword().length() < 6) {
            throw new RuntimeException(
                    "Mật khẩu mới phải có ít nhất 6 ký tự"
            );
        }

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException(
                    "Mật khẩu hiện tại không chính xác"
            );
        }

        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException(
                    "Mật khẩu mới phải khác mật khẩu hiện tại"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        return toProfileResponse(
                userRepository.save(user)
        );
    }

    public UserProfileResponse getUserById(
            Long userId
    ) {
        return toProfileResponse(
                getUserEntity(userId)
        );
    }

    public List<UserProfileResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::toProfileResponse)
                .toList();
    }

    public UserProfileResponse setUserEnabled(
            Long userId,
            boolean enabled
    ) {

        User user =
                getUserEntity(userId);

        user.setEnabled(
                enabled
        );

        return toProfileResponse(
                userRepository.save(user)
        );
    }

    public UserProfileResponse addRole(
            Long userId,
            RoleName roleName
    ) {

        User user =
                getUserEntity(userId);

        Role role =
                roleRepository
                        .findByName(roleName)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy role "
                                                + roleName
                                )
                        );

        if (user.getRoles().contains(role)) {
            throw new RuntimeException(
                    "Người dùng đã có role này"
            );
        }

        user.getRoles().add(
                role
        );

        return toProfileResponse(
                userRepository.save(user)
        );
    }

    public UserProfileResponse removeRole(
            Long userId,
            RoleName roleName
    ) {

        User user =
                getUserEntity(userId);

        Role role =
                roleRepository
                        .findByName(roleName)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy role "
                                                + roleName
                                )
                        );

        if (!user.getRoles().contains(role)) {
            throw new RuntimeException(
                    "Người dùng không có role này"
            );
        }

        if (user.getRoles().size() <= 1) {
            throw new RuntimeException(
                    "Người dùng phải có ít nhất một role"
            );
        }

        user.getRoles().remove(
                role
        );

        return toProfileResponse(
                userRepository.save(user)
        );
    }

    public UserProfileResponse resetPassword(
        Long userId,
        String newPassword
) {

    if (newPassword == null
            || newPassword.isBlank()) {

        throw new RuntimeException(
                "Mật khẩu mới không được để trống"
        );
    }

    if (newPassword.length() < 6) {

        throw new RuntimeException(
                "Mật khẩu mới phải có ít nhất 6 ký tự"
        );
    }

    User user =
            getUserEntity(userId);

    user.setPassword(
            passwordEncoder.encode(
                    newPassword
            )
    );

    return toProfileResponse(
            userRepository.save(user)
    );
}

    private User getUserEntity(
            Long userId
    ) {

        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy người dùng"
                        )
                );
    }

    private UserProfileResponse toProfileResponse(
            User user
    ) {

        Set<String> roles =
                user.getRoles()
                        .stream()
                        .map(role ->
                                role.getName().name()
                        )
                        .collect(
                                Collectors.toSet()
                        );

        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getEnabled(),
                roles
        );
    }
}