package com.clinic.gateway.config;

import com.clinic.gateway.security.GatewayJwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final GatewayJwtAuthenticationFilter jwtFilter;

    public SecurityConfig(GatewayJwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "X-User-Id", "X-User-Roles", "X-User-Email"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .exceptionHandling(exception ->
                        exception
                                .authenticationEntryPoint((request, response, authException) -> {
                                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                    response.setContentType("application/json");
                                    response.getWriter().write("""
                                            {
                                              "status":401,
                                              "error":"Unauthorized"
                                            }
                                            """);
                                })
                                .accessDeniedHandler((request, response, accessDeniedException) -> {
                                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                    response.setContentType("application/json");
                                    response.getWriter().write("""
                                            {
                                              "status":403,
                                              "error":"Forbidden"
                                            }
                                            """);
                                })
                )

                .authorizeHttpRequests(auth ->
                        auth
                                // =========================================
                                // PUBLIC AUTH & HEALTH
                                // =========================================
                                .requestMatchers(
                                        "/api/auth/register",
                                        "/api/auth/login",
                                        "/api/auth/refresh",
                                        "/api/auth/logout",
                                        "/actuator/health",
                                        "/error"
                                )
                                .permitAll()

                                // =========================================
                                // PUBLIC DOCTORS, SPECIALTIES & AI FOR GUEST BROWSING
                                // =========================================
                                .requestMatchers(HttpMethod.GET, "/api/doctors/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/specialties/**").permitAll()
                                .requestMatchers("/api/ai/**").permitAll()

                                // =========================================
                                // AUTH SERVICE - ADMIN
                                // =========================================
                                .requestMatchers(
                                        "/api/auth/users",
                                        "/api/auth/users/**"
                                )
                                .hasRole("ADMIN")

                                // =========================================
                                // PATIENT SERVICE
                                // =========================================
                                .requestMatchers(HttpMethod.GET, "/api/patients/**")
                                .hasAnyRole("PATIENT", "DOCTOR", "RECEPTIONIST", "ADMIN")

                                .requestMatchers(HttpMethod.POST, "/api/patients/me", "/api/patients/me/")
                                .hasRole("PATIENT")

                                .requestMatchers(HttpMethod.POST, "/api/patients", "/api/patients/")
                                .hasAnyRole("RECEPTIONIST", "ADMIN")

                                .requestMatchers(HttpMethod.PUT, "/api/patients/**")
                                .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")

                                // =========================================
                                // DOCTOR MANAGEMENT & SCHEDULE (WRITE/MODIFY)
                                // =========================================
                                .requestMatchers(HttpMethod.POST, "/api/doctors", "/api/doctors/").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/doctors/{id}").hasAnyRole("DOCTOR", "ADMIN")

                                .requestMatchers(HttpMethod.POST, "/api/doctors/*/schedules", "/api/doctors/*/time-offs").hasAnyRole("DOCTOR", "ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/doctors/schedules/**", "/api/doctors/time-offs/**").hasAnyRole("DOCTOR", "ADMIN")
                                .requestMatchers(HttpMethod.PATCH, "/api/doctors/schedules/**", "/api/doctors/time-offs/**").hasAnyRole("DOCTOR", "ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/doctors/schedules/**", "/api/doctors/time-offs/**").hasAnyRole("DOCTOR", "ADMIN")

                                // =========================================
                                // SPECIALTY MANAGEMENT (WRITE/MODIFY)
                                // =========================================
                                .requestMatchers(HttpMethod.POST, "/api/specialties/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/specialties/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PATCH, "/api/specialties/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/specialties/**").hasRole("ADMIN")

                                // =========================================
                                // APPOINTMENT - CREATE / READ
                                // =========================================
                                .requestMatchers(HttpMethod.POST, "/api/appointments", "/api/appointments/")
                                .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")

                                .requestMatchers(HttpMethod.GET, "/api/appointments/**")
                                .hasAnyRole("PATIENT", "DOCTOR", "RECEPTIONIST", "ADMIN")

                                // =========================================
                                // APPOINTMENT - RECEPTIONIST WORKFLOW
                                // =========================================
                                .requestMatchers(
                                        HttpMethod.PATCH,
                                        "/api/appointments/*/confirm",
                                        "/api/appointments/*/check-in",
                                        "/api/appointments/*/waiting",
                                        "/api/appointments/*/no-show"
                                )
                                .hasAnyRole("RECEPTIONIST", "ADMIN")

                                .requestMatchers(HttpMethod.PATCH, "/api/appointments/*/reschedule")
                                .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")

                                // =========================================
                                // APPOINTMENT - DOCTOR WORKFLOW
                                // =========================================
                                .requestMatchers(
                                        HttpMethod.PATCH,
                                        "/api/appointments/*/start-exam",
                                        "/api/appointments/*/complete"
                                )
                                .hasAnyRole("DOCTOR", "ADMIN")

                                // =========================================
                                // APPOINTMENT CANCEL
                                // =========================================
                                .requestMatchers(HttpMethod.PATCH, "/api/appointments/*/cancel")
                                .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")

                                // =========================================
                                // MEDICAL RECORD & VITAL SIGNS
                                // =========================================
                                .requestMatchers(HttpMethod.GET, "/api/medical-records/**", "/api/vital-signs/**")
                                .hasAnyRole("PATIENT", "DOCTOR", "ADMIN")

                                .requestMatchers(HttpMethod.POST, "/api/medical-records/**", "/api/vital-signs/**")
                                .hasAnyRole("DOCTOR", "ADMIN")

                                .requestMatchers(HttpMethod.PUT, "/api/medical-records/**", "/api/vital-signs/**")
                                .hasAnyRole("DOCTOR", "ADMIN")

                                // =========================================
                                // PRESCRIPTIONS & MEDICINES
                                // =========================================
                                .requestMatchers(HttpMethod.GET, "/api/prescriptions/**", "/api/medicines/**")
                                .hasAnyRole("PATIENT", "DOCTOR", "RECEPTIONIST", "ADMIN")

                                .requestMatchers(HttpMethod.POST, "/api/prescriptions/**")
                                .hasAnyRole("DOCTOR", "ADMIN")

                                .requestMatchers(HttpMethod.POST, "/api/medicines/**", "/api/medicines")
                                .hasAnyRole("RECEPTIONIST", "ADMIN")

                                .requestMatchers(HttpMethod.PUT, "/api/medicines/**")
                                .hasAnyRole("RECEPTIONIST", "ADMIN")

                                .requestMatchers(HttpMethod.PATCH, "/api/medicines/**")
                                .hasAnyRole("RECEPTIONIST", "ADMIN")

                                // =========================================
                                // INVOICES & PAYMENTS
                                // =========================================
                                .requestMatchers(HttpMethod.GET, "/api/invoices/**", "/api/payments/**")
                                .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")

                                .requestMatchers(HttpMethod.POST, "/api/invoices/**", "/api/payments/**")
                                .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")

                                .requestMatchers(HttpMethod.PATCH, "/api/invoices/**", "/api/payments/*/pay")
                                .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")

                                .requestMatchers(HttpMethod.PATCH, "/api/payments/*/refund")
                                .hasAnyRole("RECEPTIONIST", "ADMIN")

                                // =========================================
                                // ANY OTHER REQUEST
                                // =========================================
                                .anyRequest()
                                .authenticated()
                )

                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
