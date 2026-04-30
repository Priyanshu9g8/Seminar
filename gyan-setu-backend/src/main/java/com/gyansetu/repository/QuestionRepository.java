package com.gyansetu.repository;

import com.gyansetu.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByAssignmentId(Long assignmentId);
}
