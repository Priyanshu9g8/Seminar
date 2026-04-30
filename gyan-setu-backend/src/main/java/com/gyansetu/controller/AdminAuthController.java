package com.gyansetu.controller;

import com.gyansetu.dto.AuthRequest;
import com.gyansetu.dto.AuthResponse;
import com.gyansetu.service.AuthService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * PUBLIC endpoint — no authentication required.
 * Admin can ONLY log in; admin accounts are seeded, not self-registered.
 *
 * POST /api/admin/auth/login — admin login
 */
@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin
public class AdminAuthController {

    private final AuthService authService;

    public AdminAuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Admin login using seeded credentials.
     * Returns 400 if credentials belong to a non-admin account.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.ok(authService.loginAdmin(req));
    }
}
