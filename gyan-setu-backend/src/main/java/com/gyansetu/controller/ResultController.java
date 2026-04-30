package com.gyansetu.controller;

import com.gyansetu.model.Result;
import com.gyansetu.model.User;
import com.gyansetu.model.Assignment;
import com.gyansetu.repository.ResultRepository;
import com.gyansetu.repository.UserRepository;
import com.gyansetu.repository.AssignmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/results")
@CrossOrigin
public class ResultController {

    private final ResultRepository resultRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;

    public ResultController(ResultRepository resultRepository, UserRepository userRepository, AssignmentRepository assignmentRepository) {
        this.resultRepository = resultRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
    }

    private Long getStudentId(Authentication auth) {
        if (auth == null) return null;
        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        return user != null ? user.getId() : null;
    }

    @PostMapping
    public Result saveResult(@RequestBody Result result, Authentication auth) {
        // Enforce JWT-based student attribution to prevent cross-account data leakage
        Long studentId = getStudentId(auth);
        if (studentId != null) {
            result.setStudentId(studentId);
        }
        return resultRepository.save(result);
    }

    @GetMapping("/my-results")
    public ResponseEntity<?> getMyResults(Authentication auth) {
        Long studentId = getStudentId(auth);
        if (studentId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        List<Result> results = resultRepository.findByStudentId(studentId);
        List<Map<String, Object>> response = new ArrayList<>();

        for (Result r : results) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("id", r.getId());
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
            response.add(entry);
        }

        // Sort by submittedAt descending (newest first)
        response.sort((a, b) -> ((java.time.LocalDateTime) b.get("submittedAt"))
                .compareTo((java.time.LocalDateTime) a.get("submittedAt")));

        return ResponseEntity.ok(response);
    }
}
