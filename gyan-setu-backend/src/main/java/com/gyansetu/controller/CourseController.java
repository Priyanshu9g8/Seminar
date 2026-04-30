package com.gyansetu.controller;

import com.gyansetu.dto.CourseDTO;
import com.gyansetu.model.ClassLevel;
import com.gyansetu.service.CourseService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin("*")
public class CourseController {


    private final CourseService courses;

    public CourseController(CourseService courses){
        this.courses = courses;
    }

    @GetMapping
    public ResponseEntity<List<CourseDTO>> list(
            @RequestParam(value="classLevel", required=false) String classLevel){

        ClassLevel level = null;

        if(classLevel != null){
            level = ClassLevel.valueOf(classLevel);
        }

        return ResponseEntity.ok(courses.listAll(level));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> get(@PathVariable Long id){
        return ResponseEntity.ok(courses.getById(id));
    }

}
