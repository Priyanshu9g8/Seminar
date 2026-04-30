package com.gyansetu.security;

import com.gyansetu.repository.UserRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtUtil                  jwtUtil;
    private final UserRepository           userRepository;
    private final CorsConfigurationSource  corsConfigurationSource;

    public SecurityConfig(
            JwtUtil jwtUtil,
            UserRepository userRepository,
            @Qualifier("corsConfigurationSource") CorsConfigurationSource corsConfigurationSource) {
        this.jwtUtil                = jwtUtil;
        this.userRepository         = userRepository;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        JwtAuthenticationFilter jwtFilter =
                new JwtAuthenticationFilter(jwtUtil, userRepository);

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Return 401 JSON instead of a redirect when unauthenticated
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )

            .authorizeHttpRequests(auth -> auth

                // ── Static / frontend ────────────────────────────────────────
                .requestMatchers("/", "/index.html", "/teacher.html", "/analytics.html").permitAll()
                .requestMatchers("/assets/**", "/favicon.ico").permitAll()

                // ── Public auth endpoints ─────────────────────────────────────
                // Admin login — must come BEFORE the broad /api/admin/** rule below
                .requestMatchers("/api/admin/auth/**").permitAll()
                // Teacher login only (no self-register)
                .requestMatchers("/api/teacher/auth/login").permitAll()
                // Student login (no self-register)
                .requestMatchers("/api/student/login").permitAll()

                // ── Other public APIs ─────────────────────────────────────────
                .requestMatchers("/api/courses/**").permitAll()
                .requestMatchers("/api/questions/**").permitAll()
                .requestMatchers("/api/ai/**").permitAll()

                // ── Exam APIs \u2014 accessible by both TEACHER and STUDENT ────────
                .requestMatchers("/api/exam/**").authenticated()

                // ── Role-protected APIs ───────────────────────────────────────
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/teacher/**").hasRole("TEACHER")
                .requestMatchers("/api/student/**").hasRole("STUDENT")

                // ── Everything else needs authentication ──────────────────────
                .anyRequest().authenticated()
            )

            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
