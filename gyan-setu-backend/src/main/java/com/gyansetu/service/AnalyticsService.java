package com.gyansetu.service;

import com.gyansetu.model.StudentResult;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AnalyticsService {

    public Map<String,Object> calculateAnalytics(){

        List<StudentResult> results=new ArrayList<>();

        results.add(new StudentResult("Ravi","Math",80));
        results.add(new StudentResult("Sita","Math",70));
        results.add(new StudentResult("Aman","Science",60));
        results.add(new StudentResult("Riya","Science",75));
        results.add(new StudentResult("Raj","English",68));

        Map<String,Object> analytics=new HashMap<>();

        int totalScore=0;

        for(StudentResult r:results){
            totalScore+=r.getScore();
        }

        double avg=(double)totalScore/results.size();

        analytics.put("totalStudents",results.size());
        analytics.put("averageScore",avg);
        analytics.put("results",results);

        return analytics;

    }

}
