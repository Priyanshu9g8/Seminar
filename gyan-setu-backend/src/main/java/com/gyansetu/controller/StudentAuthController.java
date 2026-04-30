package com.gyansetu.controller;

import com.gyansetu.dto.AuthRequest;
import com.gyansetu.dto.AuthResponse;
import com.gyansetu.model.User;
import com.gyansetu.repository.UserRepository;
import com.gyansetu.service.AuthService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Endpoints under /api/student.
 * Login is PUBLIC; profile requires authentication.
 */
@RestController
@RequestMapping("/api/student")
public class StudentAuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public StudentAuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    /**
     * Student login using credentials provided by their teacher.
     * Returns 400 if credentials belong to a teacher account.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.ok(authService.loginStudent(req));
    }

    /**
     * GET /api/student/profile
     * Returns the logged-in student's profile including classLevel.
     * Used by the Student Dashboard to fetch active exams.
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        User student = userRepository.findByUsername(auth.getName()).orElse(null);
        if (student == null) return ResponseEntity.status(404).body(Map.of("message", "User not found"));

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id",         student.getId());
        profile.put("fullName",   student.getFullName());
        profile.put("username",   student.getUsername());
        profile.put("email",      student.getEmail());
        profile.put("classLevel", student.getClassLevel() != null ? student.getClassLevel().name() : null);
        profile.put("role",       student.getRole());
        return ResponseEntity.ok(profile);
    }
}
