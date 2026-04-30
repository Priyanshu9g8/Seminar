package com.gyansetu.controller;

import com.gyansetu.dto.*;
import com.gyansetu.service.AITeacherService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin("*")
public class AiController {

    private final AITeacherService aiTeacherService;

    public AiController(AITeacherService aiTeacherService) {
        this.aiTeacherService = aiTeacherService;
    }

    // =========================
    // AI TEACHER CHAT (POST)
    // =========================
    @PostMapping("/ask")
    public AITeacherResponse askTeacher(@RequestBody AITeacherRequest request) {

        String answer = aiTeacherService.askTeacher(request.getQuestion());

        return new AITeacherResponse(answer);
    }

    // =========================
    // AI TEACHER CHAT (GET)
    // =========================
    @GetMapping("/chat")
    public Map<String, String> chat(@RequestParam String q) {

        String answer = aiTeacherService.askTeacher(q);

        return Map.of("answer", answer);
    }

    // =========================
    // AI QUIZ GENERATOR
    // =========================
    @GetMapping("/quiz")
    public Map<String, Object> quiz(@RequestParam String topic, @RequestParam(defaultValue = "en") String lang) {

        String quizJson = aiTeacherService.generateQuiz(topic, lang);

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.List<Map<String,Object>> list = mapper.readValue(quizJson, java.util.List.class);
            return Map.of("questions", list);
        } catch (Exception e) {
            return Map.of("questions", new java.util.ArrayList<>());
        }
    }

    // =========================
    // AI LESSON GENERATOR
    // =========================
    @GetMapping("/lesson")
    public Map<String, String> lesson(@RequestParam String topic, @RequestParam(defaultValue = "en") String lang) {

        String lesson = aiTeacherService.generateLesson(topic, lang);

        return Map.of("lesson", lesson);
    }
}