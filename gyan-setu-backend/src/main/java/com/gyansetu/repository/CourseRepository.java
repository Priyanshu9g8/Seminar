
package com.gyansetu.repository;
import com.gyansetu.model.ClassLevel; import com.gyansetu.model.Course; import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; import java.util.Optional;
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByClassLevel(ClassLevel classLevel);
    Optional<Course> findByTitle(String title);
    boolean existsByTitle(String title);
}
