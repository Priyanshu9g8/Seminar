
package com.gyansetu.dto;
import com.gyansetu.model.ClassLevel; import com.gyansetu.model.Course;
public class CourseDTO {
    private Long id; private String title; private String description; private ClassLevel classLevel; private int durationWeeks;
    private String instructorName; private String price; private String thumbnailImageUrl;
    public static CourseDTO from(Course c){ CourseDTO dto=new CourseDTO(); dto.id=c.getId(); dto.title=c.getTitle(); dto.description=c.getDescription();
        dto.classLevel=c.getClassLevel(); dto.durationWeeks=c.getDurationWeeks(); dto.instructorName=c.getInstructorName();
        dto.price=c.getPrice(); dto.thumbnailImageUrl=c.getThumbnailImageUrl(); return dto; }
    public Long getId(){return id;} public String getTitle(){return title;} public String getDescription(){return description;}
    public ClassLevel getClassLevel(){return classLevel;} public int getDurationWeeks(){return durationWeeks;}
    public String getInstructorName(){return instructorName;} public String getPrice(){return price;}
    public String getThumbnailImageUrl(){return thumbnailImageUrl;}
}
