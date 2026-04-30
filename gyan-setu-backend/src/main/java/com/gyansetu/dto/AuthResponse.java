package com.gyansetu.dto;

/**
 * Returned on every successful login or registration.
 * {@code classLevel} is only populated for STUDENT accounts.
 */
public class AuthResponse {

    private String token;
    private Long   userId;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private String classLevel;   // null for teachers

    public AuthResponse(String token, Long userId, String username,
                        String fullName, String email, String role, String classLevel) {
        this.token      = token;
        this.userId     = userId;
        this.username   = username;
        this.fullName   = fullName;
        this.email      = email;
        this.role       = role;
        this.classLevel = classLevel;
    }

    // ─── Getters ─────────────────────────────────────────────────────────

    public String getToken()      { return token; }
    public Long   getUserId()     { return userId; }
    public String getUsername()   { return username; }
    public String getFullName()   { return fullName; }
    public String getEmail()      { return email; }
    public String getRole()       { return role; }
    public String getClassLevel() { return classLevel; }
}
