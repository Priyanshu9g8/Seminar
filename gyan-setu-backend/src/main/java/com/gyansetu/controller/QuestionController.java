package com.gyansetu.controller;

import com.gyansetu.model.Question;
import com.gyansetu.repository.QuestionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:5173")
public class QuestionController {

    private final QuestionRepository questionRepository;

    public QuestionController(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @GetMapping("/assignment/{assignmentId}")
    public List<Question> getQuestionsByAssignment(@PathVariable Long assignmentId) {
        return questionRepository.findByAssignmentId(assignmentId);
    }
}
