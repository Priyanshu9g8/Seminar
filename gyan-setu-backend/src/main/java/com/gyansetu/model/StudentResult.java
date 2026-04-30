package com.gyansetu.model;

public class StudentResult {

    private String studentName;
    private String course;
    private int score;

    public StudentResult(){}

    public StudentResult(String studentName,String course,int score){
        this.studentName=studentName;
        this.course=course;
        this.score=score;
    }

    public String getStudentName(){ return studentName; }
    public String getCourse(){ return course; }
    public int getScore(){ return score; }

    public void setStudentName(String studentName){ this.studentName=studentName; }
    public void setCourse(String course){ this.course=course; }
    public void setScore(int score){ this.score=score; }

}
