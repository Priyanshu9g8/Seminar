package com.gyansetu.dto;

import com.gyansetu.model.ClassLevel;
import jakarta.validation.constraints.*;

/**
 * Payload for teacher self-registration at POST /api/teacher/auth/register.
 * Role is always set to TEACHER inside AuthService — it is NOT accepted from the client.
 */
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 120, message = "Full name must be between 2 and 120 characters")
    private String fullName;

    @Size(max = 150)
    private String email;

    /** Optional — assigns this teacher to a specific class. Null means teacher manages all classes. */
    private ClassLevel classLevel;

    // ─── Getters & Setters ───────────────────────────────────────────────

    public String getUsername() { return username; }
    public void setUsername(String v) { this.username = v; }

    public String getPassword() { return password; }
    public void setPassword(String v) { this.password = v; }

    public String getFullName() { return fullName; }
    public void setFullName(String v) { this.fullName = v; }

    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }

    public ClassLevel getClassLevel() { return classLevel; }
    public void setClassLevel(ClassLevel v) { this.classLevel = v; }
}
