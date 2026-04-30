package com.gyansetu.controller;

import com.gyansetu.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin
public class AnalyticsController {

    @Autowired
    AnalyticsService analyticsService;

    @GetMapping("/students")
    public Map<String,Object> getAnalytics(){

        return analyticsService.calculateAnalytics();

    }

}
