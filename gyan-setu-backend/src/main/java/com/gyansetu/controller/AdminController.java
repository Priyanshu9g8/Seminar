package com.gyansetu.controller;

import com.gyansetu.dto.AuthResponse;
import com.gyansetu.dto.CreateStudentRequest;
import com.gyansetu.dto.RegisterRequest;
import com.gyansetu.model.Assignment;
import com.gyansetu.model.Result;
import com.gyansetu.model.Role;
import com.gyansetu.model.User;
import com.gyansetu.repository.AssignmentRepository;
import com.gyansetu.repository.ResultRepository;
import com.gyansetu.repository.UserRepository;
import com.gyansetu.service.AuthService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * ADMIN-ONLY endpoints — requires a valid JWT with role ADMIN.
 *
 * GET    /api/admin/stats              — platform statistics
 * GET    /api/admin/teachers           — list all teachers
 * POST   /api/admin/teachers           — register a new teacher (Admin only)
 * GET    /api/admin/students           — list all students
 * POST   /api/admin/students           — create a student (Admin only)
 * GET    /api/admin/users/{id}/details — full profile + marks for any user
 * DELETE /api/admin/users/{id}         — delete any user (except admin itself)
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    private final UserRepository       userRepository;
    private final ResultRepository     resultRepository;
    private final AssignmentRepository assignmentRepository;
    private final AuthService          authService;

    public AdminController(UserRepository userRepository,
                           ResultRepository resultRepository,
                           AssignmentRepository assignmentRepository,
                           AuthService authService) {
        this.userRepository       = userRepository;
        this.resultRepository     = resultRepository;
        this.assignmentRepository = assignmentRepository;
        this.authService          = authService;
    }

    // ── Platform stats ─────────────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalTeachers = userRepository.findByRole(Role.TEACHER).size();
        long totalStudents = userRepository.findByRole(Role.STUDENT).size();
        long totalResults  = resultRepository.count();

        double avgScore = 0;
        List<Result> allResults = resultRepository.findAll();
        if (!allResults.isEmpty()) {
            avgScore = allResults.stream()
                    .filter(r -> r.getTotalQuestions() > 0)
                    .mapToDouble(r -> (r.getScore() * 100.0) / r.getTotalQuestions())
                    .average()
                    .orElse(0);
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalTeachers", totalTeachers);
        stats.put("totalStudents", totalStudents);
        stats.put("totalQuizzes", totalResults);
        stats.put("averageScore", Math.round(avgScore));
        return ResponseEntity.ok(stats);
    }

    // ── List all teachers ──────────────────────────────────────────────
    @GetMapping("/teachers")
    public List<User> getTeachers() {
        return userRepository.findByRole(Role.TEACHER);
    }

    // ── Register a new teacher (Admin only) ───────────────────────────
    @PostMapping("/teachers")
    public ResponseEntity<AuthResponse> registerTeacher(@Valid @RequestBody RegisterRequest req) {
        AuthResponse response = authService.registerTeacher(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── List all students ──────────────────────────────────────────────
    @GetMapping("/students")
    public List<User> getStudents() {
        return userRepository.findByRole(Role.STUDENT);
    }

    // ── Create a student (Admin only) ─────────────────────────────────
    @PostMapping("/students")
    public ResponseEntity<AuthResponse> createStudent(@Valid @RequestBody CreateStudentRequest req) {
        AuthResponse response = authService.createStudent(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── Get user details (teacher or student) ─────────────────────────
    @GetMapping("/users/{id}/details")
    public ResponseEntity<?> getUserDetails(@PathVariable("id") Long id) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("id", user.getId());
            response.put("fullName", user.getFullName());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("classLevel", user.getClassLevel());
            response.put("createdAt", user.getCreatedAt());
            response.put("rawPassword", user.getRawPassword());

            // If student, include marks
            if (user.getRole() == Role.STUDENT) {
                List<Result> results = resultRepository.findByStudentId(id);
                List<Map<String, Object>> marks = new ArrayList<>();
                for (Result r : results) {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("score", r.getScore());
                    entry.put("totalQuestions", r.getTotalQuestions());
                    entry.put("percentage",
                            r.getTotalQuestions() > 0
                                    ? Math.round((r.getScore() * 100.0) / r.getTotalQuestions())
                                    : 0);
                    entry.put("submittedAt", r.getSubmittedAt());

                    if (r.getAssignmentId() != null) {
                        Optional<Assignment> assignmentOpt = assignmentRepository.findById(r.getAssignmentId());
                        if (assignmentOpt.isPresent()) {
                            Assignment assignment = assignmentOpt.get();
                            entry.put("assignmentTitle", assignment.getTitle());
                            entry.put("subject", assignment.getCourse() != null
                                    ? assignment.getCourse().getTitle() : "General");
                        } else {
                            entry.put("assignmentTitle", "Deleted Assignment");
                            entry.put("subject", "Unknown");
                        }
                    } else {
                        entry.put("assignmentTitle", "Quiz");
                        entry.put("subject", "General");
                    }
                    marks.add(entry);
                }

                response.put("marks", marks);
                response.put("totalAttempts", marks.size());
                response.put("averageScore",
                        marks.isEmpty() ? 0
                                : marks.stream()
                                .mapToInt(m -> (int) m.get("percentage"))
                                .average()
                                .orElse(0));
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    // ── Delete any user (teacher or student) ──────────────────────────
    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }
            if (user.getRole() == Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("message", "Cannot delete an admin user"));
            }

            if (user.getRole() == Role.STUDENT) {
                resultRepository.deleteByStudentId(id);
            }

            userRepository.deleteById(id);

            String roleLabel = user.getRole() == Role.TEACHER ? "Teacher" : "Student";
            return ResponseEntity.ok(Map.of("message", roleLabel + " deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Delete failed: " + e.getMessage()));
        }
    }
}
