
package com.gyansetu.config;
import com.gyansetu.model.ClassLevel; import com.gyansetu.model.Course; import com.gyansetu.model.Role; import com.gyansetu.model.User;
import com.gyansetu.repository.CourseRepository; import com.gyansetu.repository.UserRepository; import org.springframework.boot.CommandLineRunner; import org.springframework.context.annotation.Bean; import org.springframework.context.annotation.Configuration; import org.springframework.security.crypto.password.PasswordEncoder; import java.util.List;
import javax.sql.DataSource;
import org.springframework.jdbc.core.JdbcTemplate;
@Configuration
public class DataInitializer {
    @Bean CommandLineRunner seedData(CourseRepository courses, UserRepository users, PasswordEncoder encoder, DataSource dataSource){
        return args -> {
            // Fix: convert any empty-string emails to NULL so the unique constraint works correctly
            JdbcTemplate jdbc = new JdbcTemplate(dataSource);
            jdbc.update("UPDATE users SET email = NULL WHERE email = ''");

            // NOTE: We intentionally do NOT delete exam_submissions here.
            // Aggressive cleanup was causing valid submissions to be lost (e.g. submissions
            // saved before the JWT fix that had wrong student_ids — these need to be repaired
            // via the admin API, not silently deleted on every restart).

            if (!users.existsByUsername("admin")) {
                User admin = new User(); admin.setUsername("admin"); admin.setPasswordHash(encoder.encode("Admin@123"));
                admin.setFullName("Site Admin"); admin.setEmail("admin@gyansetu.local"); admin.setRole(Role.ADMIN); users.save(admin); }
            List<Course> seed = List.of(
                make("Happy ABCs", "Let's sing and trace letters A–Z with animals and actions!", ClassLevel.CLASS_1, 4, "Ms. Meera", "https://picsum.photos/seed/abcs/600/400"),
                make("Numbers 1–20 Fun", "Count toys, fruits, and stars while learning to write numbers.", ClassLevel.CLASS_1, 4, "Mr. Rahul", "https://picsum.photos/seed/nums/600/400"),
                make("Shapes & Colors Party", "Circle, square, triangle — find shapes and mix colors!", ClassLevel.CLASS_1, 3, "Ms. Anaya", "https://picsum.photos/seed/shapes/600/400"),
                make("Storytime: Friendly Forest", "Short, sweet stories that teach kindness and sharing.", ClassLevel.CLASS_1, 4, "Grandma Lata", "https://picsum.photos/seed/stories/600/400"),
                make("Add & Subtract Starter", "Hands-on practice with candies and pencils to add/subtract up to 20.", ClassLevel.CLASS_2, 4, "Mr. Amit", "https://picsum.photos/seed/addsub/600/400"),
                make("Drawing Doodles", "Learn to draw animals and simple scenes step-by-step.", ClassLevel.CLASS_2, 3, "Ms. Priya", "https://picsum.photos/seed/draw1/600/400"),
                make("Our Senses & Weather", "Smell, taste, touch and sunny/rainy days explained simply.", ClassLevel.CLASS_3, 4, "Ms. Nisha", "https://picsum.photos/seed/science1/600/400"),
                make("Times Tables 2–5", "Skip-count songs and games to memorize 2 to 5 tables.", ClassLevel.CLASS_3, 4, "Mr. Sunil", "https://picsum.photos/seed/tables/600/400"),
                make("Good Habits & Manners", "Polite words, clean habits, and caring for others.", ClassLevel.CLASS_4, 3, "Ms. Ritu", "https://picsum.photos/seed/morals/600/400"),
                make("Reading Little Paragraphs", "Read small stories and answer simple questions.", ClassLevel.CLASS_4, 4, "Mr. Joseph", "https://picsum.photos/seed/reading/600/400"),
                make("Math Puzzles & Patterns", "Fun patterns, odd/even, and simple word problems.", ClassLevel.CLASS_5, 4, "Ms. Kavya", "https://picsum.photos/seed/patterns/600/400"),
                make("Amazing Plants & Animals", "Life cycles, habitats, and how to care for nature.", ClassLevel.CLASS_6, 4, "Dr. Reena", "https://picsum.photos/seed/nature/600/400")
            );
            for (Course c : seed) { if (!courses.existsByTitle(c.getTitle())) { courses.save(c); } }
        }; }
    private static Course make(String title, String desc, ClassLevel level, int weeks, String teacher, String thumb){ Course c=new Course(); c.setTitle(title); c.setDescription(desc); c.setClassLevel(level); c.setDurationWeeks(weeks); c.setInstructorName(teacher); c.setPrice("FREE"); c.setThumbnailImageUrl(thumb); return c; }
}
