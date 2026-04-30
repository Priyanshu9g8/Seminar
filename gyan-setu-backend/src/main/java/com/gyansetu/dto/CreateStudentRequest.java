package com.gyansetu.dto;

import com.gyansetu.model.ClassLevel;
import jakarta.validation.constraints.*;

/**
 * Payload sent by a TEACHER to create a new student account.
 * The student's username will default to their email address.
 */
public class CreateStudentRequest {

    @NotBlank(message = "Student name is required")
    @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
    private String name;

    @Size(max = 150)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Class/Grade is required")
    private ClassLevel classLevel;

    // ─── Getters & Setters ───────────────────────────────────────────────

    public String getName() { return name; }
    public void setName(String v) { this.name = v; }

    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }

    public String getPassword() { return password; }
    public void setPassword(String v) { this.password = v; }

    public ClassLevel getClassLevel() { return classLevel; }
    public void setClassLevel(ClassLevel v) { this.classLevel = v; }
}
