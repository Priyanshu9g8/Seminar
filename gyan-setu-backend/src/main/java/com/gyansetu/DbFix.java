package com.gyansetu;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DbFix {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:mysql://127.0.0.1:3306/gyan_setu?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        System.out.println("Connecting to database...");
        try (Connection conn = DriverManager.getConnection(url, "root", "Priyanshu@1008");
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Executing UPDATE statements...");
            int coursesUpdated = stmt.executeUpdate("UPDATE courses SET class_level = 'CLASS_1' WHERE class_level = 'KG'");
            int usersUpdated = stmt.executeUpdate("UPDATE users SET class_level = 'CLASS_1' WHERE class_level = 'KG'");
            
            // Fix existing teacher/student records that were given classes 9-12 by the old frontend:
            usersUpdated += stmt.executeUpdate("UPDATE users SET class_level = 'CLASS_8' WHERE class_level IN ('CLASS_9', 'CLASS_10', 'CLASS_11', 'CLASS_12')");

            // Fix passwords for older users created before raw_password column existed
            // We cannot decrypt the original hash, so we reset both raw_password and password_hash to 'password123'
            org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = 
               new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
            String hash = encoder.encode("password123");

            int passwordsUpdated = stmt.executeUpdate("UPDATE users SET raw_password = 'password123' WHERE raw_password IS NULL");
            int hashesUpdated = stmt.executeUpdate("UPDATE users SET password_hash = '" + hash + "' WHERE raw_password = 'password123'");

            // RESTORE ADMIN PASSWORD specifically
            String adminHash = encoder.encode("Admin@123");
            stmt.executeUpdate("UPDATE users SET raw_password = 'Admin@123', password_hash = '" + adminHash + "' WHERE username = 'admin'");

            System.out.println("Updated " + coursesUpdated + " courses.");
            System.out.println("Updated " + usersUpdated + " users.");
            System.out.println("Updated " + hashesUpdated + " hashes to match 'password123'.");

            try {
                stmt.executeUpdate("ALTER TABLE exam_submissions DROP INDEX uk_exam_student");
                System.out.println("Dropped uk_exam_student index to allow multiple attempts.");
            } catch (Exception ex) {
                System.out.println("Index uk_exam_student already dropped or not found.");
            }

            try {
                stmt.executeUpdate("ALTER TABLE exams ADD COLUMN reactivated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
                stmt.executeUpdate("UPDATE exams SET reactivated_at = created_at WHERE reactivated_at IS NULL");
                System.out.println("Added reactivated_at to exams.");
            } catch (Exception ex) {
                System.out.println("Column reactivated_at already exists.");
            }

            System.out.println("Database fix complete.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
