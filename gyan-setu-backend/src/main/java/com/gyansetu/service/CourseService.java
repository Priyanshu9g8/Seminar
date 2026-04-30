
package com.gyansetu.service;
import com.gyansetu.dto.CourseDTO; import com.gyansetu.exception.ResourceNotFoundException; import com.gyansetu.model.ClassLevel; import com.gyansetu.model.Course;
import com.gyansetu.repository.CourseRepository; import org.springframework.stereotype.Service; import java.util.List;
@Service
public class CourseService {
    private final CourseRepository courses;
    public CourseService(CourseRepository courses){ this.courses=courses; }
    public List<CourseDTO> listAll(ClassLevel classLevel){
        if (classLevel==null) return courses.findAll()
                .stream().map(CourseDTO::from).toList();
        return courses.findByClassLevel(classLevel)
                .stream().map(CourseDTO::from).toList(); }
    public CourseDTO getById(Long id){
        Course c = courses.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return CourseDTO.from(c); }
}
