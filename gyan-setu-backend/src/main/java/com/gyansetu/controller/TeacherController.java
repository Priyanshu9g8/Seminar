package com.gyansetu.controller;

import com.gyansetu.dto.AuthResponse;
import com.gyansetu.dto.CreateStudentRequest;
import com.gyansetu.model.ClassLevel;
import com.gyansetu.model.Role;
import com.gyansetu.model.User;
import com.gyansetu.model.Assignment;
import com.gyansetu.model.Result;
import com.gyansetu.repository.AssignmentRepository;
import com.gyansetu.repository.ResultRepository;
import com.gyansetu.repository.UserRepository;
import com.gyansetu.service.AuthService;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * PROTECTED endpoints — requires a valid JWT with role TEACHER.
 *
 * POST /api/teacher/add-student      — create a student for the teacher's own class only
 * GET  /api/teacher/students         — list students in the teacher's class only
 * GET  /api/teacher/students/{id}/details — student details + marks
 * DELETE /api/teacher/students/{id}  — delete a student (teacher's class only)
 */
import com.gyansetu.model.Exam;
import com.gyansetu.model.ExamSubmission;
import com.gyansetu.repository.ExamRepository;
import com.gyansetu.repository.ExamSubmissionRepository;

@RestController
@RequestMapping("/api/teacher")
@PreAuthorize("hasRole('TEACHER')")
public class TeacherController {

    private final AuthService    authService;
    private final UserRepository userRepository;
    private final ResultRepository resultRepository;
    private final AssignmentRepository assignmentRepository;
    private final ExamRepository examRepository;
    private final ExamSubmissionRepository examSubmissionRepository;

    public TeacherController(AuthService authService, 
                             UserRepository userRepository,
                             ResultRepository resultRepository,
                             AssignmentRepository assignmentRepository,
                             ExamRepository examRepository,
                             ExamSubmissionRepository examSubmissionRepository) {
        this.authService    = authService;
        this.userRepository = userRepository;
        this.resultRepository = resultRepository;
        this.assignmentRepository = assignmentRepository;
        this.examRepository = examRepository;
        this.examSubmissionRepository = examSubmissionRepository;
    }

    /**
     * GET /api/teacher/profile
     * Used by the frontend AuthContext to validate the JWT token on page refresh.
     * Returns the authenticated teacher's profile data.
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        User teacher = userRepository.findByUsername(auth.getName()).orElse(null);
        if (teacher == null) return ResponseEntity.status(404).body(Map.of("message", "Teacher not found"));

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id",       teacher.getId());
        profile.put("fullName", teacher.getFullName());
        profile.put("username", teacher.getUsername());
        profile.put("email",    teacher.getEmail());
        profile.put("role",     teacher.getRole());
        return ResponseEntity.ok(profile);
    }

    /**
     * Create a student account.
     * Enforces that the student's class matches the teacher's assigned class.
     * If the teacher has no classLevel set (e.g. they manage all classes), any class is accepted.
     */
    @PostMapping("/add-student")
    public ResponseEntity<?> addStudent(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        try {
            String name      = (String) body.get("name");
            String email     = (String) body.get("email");
            String password  = (String) body.get("password");
            String classStr  = (String) body.get("classLevel");

            // Validate required fields
            if (name == null || name.isBlank())
                return ResponseEntity.badRequest().body(Map.of("message", "Student name is required"));
            if (password == null || password.length() < 6)
                return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));
            if (classStr == null || classStr.isBlank())
                return ResponseEntity.badRequest().body(Map.of("message", "Class/Grade is required"));

            // Parse the ClassLevel enum safely
            ClassLevel classLevel;
            try {
                classLevel = ClassLevel.valueOf(classStr.toUpperCase());
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid class level: " + classStr));
            }

            // Build the DTO
            CreateStudentRequest req = new CreateStudentRequest();
            req.setName(name.trim());
            req.setPassword(password);
            req.setClassLevel(classLevel);
            req.setEmail((email != null && !email.isBlank()) ? email.trim() : null);

            AuthResponse response = authService.createStudentByTeacher(req, auth.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Server error: " + ex.getMessage()));
        }
    }


    /**
     * List student accounts.
     * If the teacher has an assigned classLevel, only returns students from that class.
     * Otherwise returns all students.
     */
    @GetMapping("/students")
    public ResponseEntity<List<User>> getStudents(Authentication auth) {
        User teacher = userRepository.findByUsername(auth.getName()).orElse(null);

        List<User> students;
        if (teacher != null) {
            // ONLY return students created by THIS teacher
            students = userRepository.findByRoleAndCreatedById(Role.STUDENT, teacher.getId());
        } else {
            // Fallback
            students = java.util.Collections.emptyList();
        }

        return ResponseEntity.ok(students);
    }

    /**
     * Get a student's details (with marks).
     * Teachers can only view students from their own class.
     */
    @GetMapping("/students/{id}/details")
    public ResponseEntity<?> getStudentDetails(
            @PathVariable Long id,
            Authentication auth) {
        User teacher = userRepository.findByUsername(auth.getName()).orElse(null);
        User student = userRepository.findById(id).orElse(null);

        if (student == null || student.getRole() != Role.STUDENT) {
            return ResponseEntity.status(404).body(Map.of("message", "Student not found"));
        }

        // Enforce ownership restriction
        if (teacher != null && !teacher.getId().equals(student.getCreatedById())) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "You can only view students you have added"));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", student.getId());
        response.put("fullName", student.getFullName());
        response.put("username", student.getUsername());
        response.put("email", student.getEmail());
        response.put("role", student.getRole());
        response.put("classLevel", student.getClassLevel());
        response.put("createdAt", student.getCreatedAt());
        response.put("rawPassword", student.getRawPassword());

        List<Result> results = resultRepository.findByStudentId(id);
        List<Map<String, Object>> marks = new ArrayList<>();
        
        // 1. Add Legacy Assignment/Quiz Results
        for (Result r : results) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("score", r.getScore());
            entry.put("totalQuestions", r.getTotalQuestions());
            entry.put("percentage", r.getTotalQuestions() > 0 
                  ? Math.round((r.getScore() * 100.0) / r.getTotalQuestions()) : 0);
            entry.put("submittedAt", r.getSubmittedAt());

            if (r.getAssignmentId() != null) {
                Optional<Assignment> assignmentOpt = assignmentRepository.findById(r.getAssignmentId());
                if (assignmentOpt.isPresent()) {
                    Assignment assignment = assignmentOpt.get();
                    entry.put("assignmentTitle", assignment.getTitle());
                    entry.put("subject", assignment.getCourse() != null ? assignment.getCourse().getTitle() : "General");
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

        // 2. Add AI Exam Submissions
        List<ExamSubmission> aiSubmissions = examSubmissionRepository.findByStudentIdOrderBySubmittedAtDesc(id);
        for (ExamSubmission sub : aiSubmissions) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("score", sub.getScore());
            entry.put("totalQuestions", sub.getTotalQuestions());
            entry.put("percentage", sub.getTotalQuestions() > 0 
                  ? Math.round((sub.getScore() * 100.0) / sub.getTotalQuestions()) : 0);
            entry.put("submittedAt", sub.getSubmittedAt());

            Optional<Exam> examOpt = examRepository.findById(sub.getExamId());
            if (examOpt.isPresent()) {
                Exam exam = examOpt.get();
                entry.put("assignmentTitle", exam.getTopic());
                entry.put("subject", "AI Exam");
            } else {
                entry.put("assignmentTitle", "Deleted AI Exam");
                entry.put("subject", "AI Exam");
            }
            marks.add(entry);
        }

        // Sort all marks by date descending
        marks.sort((a, b) -> {
            java.time.LocalDateTime dateA = (java.time.LocalDateTime) a.get("submittedAt");
            java.time.LocalDateTime dateB = (java.time.LocalDateTime) b.get("submittedAt");
            if (dateA == null || dateB == null) return 0;
            return dateB.compareTo(dateA); // newest first
        });

        response.put("marks", marks);
        response.put("totalAttempts", marks.size());
        
        double studentAvg = marks.isEmpty() ? 0 
            : marks.stream().mapToInt(m -> ((Number) m.get("percentage")).intValue()).average().orElse(0);
        response.put("averageScore", studentAvg);

        // 3. Calculate Class Rank
        if (teacher != null && student.getClassLevel() != null && !marks.isEmpty()) {
            List<User> classmates = userRepository.findByRoleAndCreatedById(Role.STUDENT, teacher.getId());
            List<Double> classAverages = new ArrayList<>();
            
            for (User peer : classmates) {
                if (peer.getClassLevel() == student.getClassLevel()) {
                    double peerAvg = calculateAverageForStudent(peer.getId());
                    if (peerAvg > 0) {
                        classAverages.add(peerAvg);
                    }
                }
            }
            // Sort averages descending
            classAverages.sort(java.util.Collections.reverseOrder());
            // Find rank (1-indexed)
            int rank = classAverages.indexOf(studentAvg) + 1;
            if (rank > 0) {
                response.put("classRank", rank);
                response.put("totalClassmatesWithScores", classAverages.size());
            }
        }

        return ResponseEntity.ok(response);
    }

    private double calculateAverageForStudent(Long studentId) {
        List<Result> legacy = resultRepository.findByStudentId(studentId);
        List<ExamSubmission> aiExams = examSubmissionRepository.findByStudentIdOrderBySubmittedAtDesc(studentId);
        
        if (legacy.isEmpty() && aiExams.isEmpty()) return 0.0;
        
        int totalPct = 0;
        int count = 0;
        
        for (Result r : legacy) {
            if (r.getTotalQuestions() > 0) {
                totalPct += Math.round((r.getScore() * 100.0) / r.getTotalQuestions());
                count++;
            }
        }
        for (ExamSubmission sub : aiExams) {
            if (sub.getTotalQuestions() > 0) {
                totalPct += Math.round((sub.getScore() * 100.0) / sub.getTotalQuestions());
                count++;
            }
        }
        
        return count == 0 ? 0.0 : (double) totalPct / count;
    }

    /**
     * Delete a student.
     * Teachers can only delete students from their own class.
     */
    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(
            @PathVariable Long id,
            Authentication auth) {
        User teacher = userRepository.findByUsername(auth.getName()).orElse(null);
        User student = userRepository.findById(id).orElse(null);

        if (student == null || student.getRole() != Role.STUDENT) {
            return ResponseEntity.status(404).body(Map.of("message", "Student not found"));
        }

        // Enforce ownership restriction
        if (teacher != null && !teacher.getId().equals(student.getCreatedById())) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "You can only delete students you have added"));
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
    }
}
