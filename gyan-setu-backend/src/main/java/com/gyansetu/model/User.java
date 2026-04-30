package com.gyansetu.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users", uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_username", columnNames = "username"),
                @UniqueConstraint(name = "uk_users_email", columnNames = "email")
})
public class User {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false, length = 100)
        private String username;

        @Column(name = "password_hash", nullable = false)
        private String passwordHash;

        @Column(name = "full_name", nullable = false, length = 120)
        private String fullName;

        @Column(length = 150)
        private String email;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false, length = 20)
        private Role role;

        /**
         * Grade/class — only populated for STUDENT accounts.
         * Nullable so TEACHER rows carry no value.
         */
        @Enumerated(EnumType.STRING)
        @Column(name = "class_level", length = 20)
        private ClassLevel classLevel;

        @Column(name = "created_at", nullable = false)
        private Instant createdAt = Instant.now();

        /**
         * Stores the raw (plain-text) password so it can be shown back to teachers
         * and admins who created the accounts.
         */
        @Column(name = "raw_password", length = 100)
        private String rawPassword;

        @Column(name = "created_by_id")
        private Long createdById;

        // ─── Getters & Setters ───────────────────────────────────────────────

        public Long getId() {
                return id;
        }

        public String getUsername() {
                return username;
        }

        public void setUsername(String v) {
                this.username = v;
        }

        public String getPasswordHash() {
                return passwordHash;
        }

        public void setPasswordHash(String v) {
                this.passwordHash = v;
        }

        public String getFullName() {
                return fullName;
        }

        public void setFullName(String v) {
                this.fullName = v;
        }

        public String getEmail() {
                return email;
        }

        public void setEmail(String v) {
                this.email = v;
        }

        public Role getRole() {
                return role;
        }

        public void setRole(Role v) {
                this.role = v;
        }

        public ClassLevel getClassLevel() {
                return classLevel;
        }

        public void setClassLevel(ClassLevel v) {
                this.classLevel = v;
        }

        public Instant getCreatedAt() {
                return createdAt;
        }

        public void setCreatedAt(Instant v) {
                this.createdAt = v;
        }

        public String getRawPassword() {
                return rawPassword;
        }

        public void setRawPassword(String v) {
                this.rawPassword = v;
        }

        public Long getCreatedById() {
                return createdById;
        }

        public void setCreatedById(Long createdById) {
                this.createdById = createdById;
        }
}