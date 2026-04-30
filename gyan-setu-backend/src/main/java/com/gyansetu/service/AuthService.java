package com.gyansetu.service;

import com.gyansetu.dto.AuthRequest;
import com.gyansetu.dto.AuthResponse;
import com.gyansetu.dto.CreateStudentRequest;
import com.gyansetu.dto.RegisterRequest;
import com.gyansetu.model.ClassLevel;
import com.gyansetu.model.Role;
import com.gyansetu.model.User;
import com.gyansetu.repository.UserRepository;
import com.gyansetu.security.JwtUtil;

import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository  userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil         jwtUtil;

    public AuthService(UserRepository userRepo, PasswordEncoder encoder, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.encoder  = encoder;
        this.jwtUtil  = jwtUtil;
    }

    // ─────────────────────────────────────────────────────────────────────
    // ADMIN action — register a teacher (ADMIN-only protected endpoint)
    // ─────────────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse registerTeacher(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername()))
            throw new IllegalArgumentException("Username already taken");
        if (req.getEmail() != null && !req.getEmail().isBlank() && userRepo.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("Email already in use");

        User teacher = new User();
        teacher.setUsername(req.getUsername());
        teacher.setPasswordHash(encoder.encode(req.getPassword()));
        teacher.setRawPassword(req.getPassword());
        teacher.setFullName(req.getFullName());
        teacher.setEmail(req.getEmail() != null && !req.getEmail().isBlank() ? req.getEmail() : null);
        teacher.setRole(Role.TEACHER);
        // classLevel on a teacher means "which class they manage"
        teacher.setClassLevel(req.getClassLevel());
        userRepo.save(teacher);

        return buildResponse(teacher);
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEACHER — login (public endpoint)
    // ─────────────────────────────────────────────────────────────────────

    public AuthResponse loginTeacher(AuthRequest req) {
        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!encoder.matches(req.getPassword(), user.getPasswordHash()))
            throw new IllegalArgumentException("Invalid credentials");

        if (user.getRole() != Role.TEACHER)
            throw new IllegalArgumentException("This login is for teachers only");

        return buildResponse(user);
    }

    // ─────────────────────────────────────────────────────────────────────
    // STUDENT — login (public endpoint, no self-registration)
    // ─────────────────────────────────────────────────────────────────────

    public AuthResponse loginStudent(AuthRequest req) {
        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!encoder.matches(req.getPassword(), user.getPasswordHash()))
            throw new IllegalArgumentException("Invalid credentials");

        if (user.getRole() != Role.STUDENT)
            throw new IllegalArgumentException("This login is for students only");

        return buildResponse(user);
    }

    // ─────────────────────────────────────────────────────────────────────
    // ADMIN — login (public endpoint, no self-registration)
    // ─────────────────────────────────────────────────────────────────────

    public AuthResponse loginAdmin(AuthRequest req) {
        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!encoder.matches(req.getPassword(), user.getPasswordHash()))
            throw new IllegalArgumentException("Invalid credentials");

        if (user.getRole() != Role.ADMIN)
            throw new IllegalArgumentException("This login is for administrators only");

        return buildResponse(user);
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEACHER action — create a student for the teacher's own class only
    // ─────────────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse createStudentByTeacher(CreateStudentRequest req, String teacherUsername) {
        // Load the calling teacher to verify their assigned class
        User teacher = userRepo.findByUsername(teacherUsername)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));

        ClassLevel teacherClass = teacher.getClassLevel();

        // If teacher has an assigned class, students must belong to that class
        if (teacherClass != null && req.getClassLevel() != teacherClass) {
            throw new IllegalArgumentException(
                "You can only add students for your assigned class: Class "
                + teacherClass.name().replace("CLASS_", "")
            );
        }

        return createStudentWithCreator(req, teacher.getId());
    }

    // ─────────────────────────────────────────────────────────────────────
    // ADMIN action — create a student for any class
    // ─────────────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse createStudentWithCreator(CreateStudentRequest req, Long creatorId) {
        // Only check email uniqueness for actual non-blank emails
        String email = (req.getEmail() != null && !req.getEmail().isBlank()) ? req.getEmail().trim() : null;
        if (email != null && userRepo.existsByEmail(email))
            throw new IllegalArgumentException("A student with this email already exists");

        String username = generateUniqueUsername(req.getName(), req.getClassLevel());

        User student = new User();
        student.setUsername(username);
        student.setPasswordHash(encoder.encode(req.getPassword()));
        student.setRawPassword(req.getPassword());   // store for teacher display
        student.setFullName(req.getName().trim());
        student.setEmail(email);   // null if not provided
        student.setRole(Role.STUDENT);
        student.setClassLevel(req.getClassLevel());
        student.setCreatedById(creatorId);
        userRepo.save(student);

        return buildResponse(student);
    }

    @Transactional
    public AuthResponse createStudent(CreateStudentRequest req) {
        return createStudentWithCreator(req, null);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────

    /** Generates a unique lowercase username from name + classLevel, e.g. priya_class3 */
    private String generateUniqueUsername(String fullName, ClassLevel classLevel) {
        String base = (fullName == null ? "student" : fullName)
                .split("\\s+")[0].toLowerCase().replaceAll("[^a-z0-9]", "");
        if (base.isEmpty()) base = "student";

        String suffix = classLevel == null ? "" : "_class" + classLevel.name()
                .toLowerCase().replace("class_", "");

        String candidate = base + suffix;
        if (!userRepo.existsByUsername(candidate)) return candidate;

        for (int i = 2; i < 1000; i++) {
            String next = candidate + "_" + i;
            if (!userRepo.existsByUsername(next)) return next;
        }
        return candidate + "_" + System.currentTimeMillis();
    }

    private AuthResponse buildResponse(User u) {
        String token = jwtUtil.generateToken(u.getUsername(), u.getRole().name(), u.getId());
        String classLevelStr = u.getClassLevel() != null ? u.getClassLevel().name() : null;
        return new AuthResponse(token, u.getId(), u.getUsername(),
                u.getFullName(), u.getEmail(), u.getRole().name(), classLevelStr);
    }
}
