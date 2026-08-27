package com.clinic.gateway.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;

@Component
public class GatewayJwtAuthenticationFilter
        extends OncePerRequestFilter {

    private static final String USER_ID_HEADER =
            "X-User-Id";

    private static final String USER_EMAIL_HEADER =
            "X-User-Email";

    private static final String USER_ROLES_HEADER =
            "X-User-Roles";

    private final GatewayJwtService gatewayJwtService;

    public GatewayJwtAuthenticationFilter(
            GatewayJwtService gatewayJwtService
    ) {
        this.gatewayJwtService =
                gatewayJwtService;
    }

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {

        String path =
                request.getServletPath();

        return path.equals("/api/auth/register")
                || path.equals("/api/auth/login")
                || path.equals("/api/auth/refresh")
                || path.equals("/api/auth/logout")
                || path.equals("/actuator/health")
                || path.equals("/error");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader =
                request.getHeader(
                        "Authorization"
                );

        if (authHeader == null
                || !authHeader.startsWith(
                        "Bearer "
                )) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        String token =
                authHeader.substring(7);

        if (!gatewayJwtService.isTokenValid(token)) {

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED
            );

            response.getWriter()
                    .write(
                            "Invalid or expired token"
                    );

            return;
        }

        String email;
        Long userId;
        List<String> roles;

        try {

            email =
                    gatewayJwtService.extractEmail(
                            token
                    );

            userId =
                    gatewayJwtService.extractUserId(
                            token
                    );

            roles =
                    gatewayJwtService.extractRoles(
                            token
                    );

            var authorities =
                    roles.stream()
                            .map(
                                    SimpleGrantedAuthority::new
                            )
                            .toList();

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            authorities
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(
                            authentication
                    );

        } catch (Exception e) {

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED
            );

            response.getWriter()
                    .write(
                            "Invalid token"
                    );

            return;
        }

        Map<String, String> trustedHeaders =
                new HashMap<>();

        if (userId != null) {
            trustedHeaders.put(
                    USER_ID_HEADER,
                    userId.toString()
            );
        }

        if (email != null) {
            trustedHeaders.put(
                    USER_EMAIL_HEADER,
                    email
            );
        }

        trustedHeaders.put(
                USER_ROLES_HEADER,
                String.join(",", roles)
        );

        HttpServletRequest trustedRequest =
                new TrustedHeaderRequestWrapper(
                        request,
                        trustedHeaders
                );

        filterChain.doFilter(
                trustedRequest,
                response
        );
    }

    private static class TrustedHeaderRequestWrapper
            extends HttpServletRequestWrapper {

        private final Map<String, String>
                trustedHeaders;

        public TrustedHeaderRequestWrapper(
                HttpServletRequest request,
                Map<String, String> trustedHeaders
        ) {
            super(request);

            this.trustedHeaders =
                    new TreeMap<>(
                            String.CASE_INSENSITIVE_ORDER
                    );

            this.trustedHeaders.putAll(
                    trustedHeaders
            );
        }

        @Override
        public String getHeader(
                String name
        ) {

            if (trustedHeaders.containsKey(name)) {
                return trustedHeaders.get(name);
            }

            if (isInternalIdentityHeader(name)) {
                return null;
            }

            return super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaders(
                String name
        ) {

            if (trustedHeaders.containsKey(name)) {

                return Collections.enumeration(
                        List.of(
                                trustedHeaders.get(name)
                        )
                );
            }

            if (isInternalIdentityHeader(name)) {

                return Collections.emptyEnumeration();
            }

            return super.getHeaders(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {

            Set<String> names =
                    new TreeSet<>(
                            String.CASE_INSENSITIVE_ORDER
                    );

            Enumeration<String> original =
                    super.getHeaderNames();

            while (original != null
                    && original.hasMoreElements()) {

                String name =
                        original.nextElement();

                if (!isInternalIdentityHeader(name)) {
                    names.add(name);
                }
            }

            names.addAll(
                    trustedHeaders.keySet()
            );

            return Collections.enumeration(
                    names
            );
        }

        private boolean isInternalIdentityHeader(
                String name
        ) {

            return USER_ID_HEADER.equalsIgnoreCase(name)
                    || USER_EMAIL_HEADER.equalsIgnoreCase(name)
                    || USER_ROLES_HEADER.equalsIgnoreCase(name);
        }
    }
}