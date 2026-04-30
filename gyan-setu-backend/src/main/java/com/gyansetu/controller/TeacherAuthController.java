package com.gyansetu.controller;

import com.gyansetu.dto.AuthRequest;
import com.gyansetu.dto.AuthResponse;
import com.gyansetu.service.AuthService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * PUBLIC endpoint — no authentication required.
 * Teachers can ONLY log in. Teacher accounts are created by the Admin only.
 *
 * POST /api/teacher/auth/login — teacher login
 *
 * NOTE: Teacher self-registration has been removed.
 *       Only the Admin can register teachers via POST /api/admin/teachers
 */
@RestController
@RequestMapping("/api/teacher/auth")
public class TeacherAuthController {

    private final AuthService authService;

    public TeacherAuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Teacher login using credentials assigned by the Admin.
     * Returns 400 if credentials belong to a non-teacher account.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.ok(authService.loginTeacher(req));
    }
}
