
package com.gyansetu.model;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;


import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name="courses", uniqueConstraints=@UniqueConstraint(name="uk_course_title", columnNames="title"))


public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, length=180) private String title;
    @Column(nullable=false, columnDefinition="TEXT") private String description;
    @Enumerated(EnumType.STRING) @Column(name="class_level", nullable=false, length=20) private ClassLevel classLevel;
    @Column(name="duration_weeks", nullable=false) private int durationWeeks;
    @Column(name="instructor_name", nullable=false, length=120) private String instructorName;
    @Column(nullable=false, length=20) private String price;
    @Column(name="thumbnail_image_url", nullable=false, length=500) private String thumbnailImageUrl;
    @Column(name="created_at", nullable=false) private Instant createdAt = Instant.now();
    @JsonManagedReference
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Assignment> assignments;
    public List<Assignment> getAssignments() { return assignments; }
    public void setAssignments(List<Assignment> assignments) { this.assignments = assignments; }


    public Long getId(){return id;} public String getTitle(){return title;} public void setTitle(String v){this.title=v;}
    public String getDescription(){return description;} public void setDescription(String v){this.description=v;}
    public ClassLevel getClassLevel(){return classLevel;} public void setClassLevel(ClassLevel v){this.classLevel=v;}
    public int getDurationWeeks(){return durationWeeks;} public void setDurationWeeks(int v){this.durationWeeks=v;}
    public String getInstructorName(){return instructorName;} public void setInstructorName(String v){this.instructorName=v;}
    public String getPrice(){return price;} public void setPrice(String v){this.price=v;}
    public String getThumbnailImageUrl(){return thumbnailImageUrl;} public void setThumbnailImageUrl(String v){this.thumbnailImageUrl=v;}
    public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant v){this.createdAt=v;}
}
