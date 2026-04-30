package com.gyansetu.repository;

import com.gyansetu.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByClassLevelAndActiveTrue(String classLevel);
    List<Exam> findByCreatedByTeacherIdOrderByCreatedAtDesc(Long teacherId);

    /** Return active exams for a class that were created by a specific teacher */
    List<Exam> findByClassLevelAndActiveTrueAndCreatedByTeacherId(String classLevel, Long teacherId);

    /** Return ALL exams (any teacher or null) ordered newest-first — used as fallback */
    List<Exam> findAllByOrderByCreatedAtDesc();

    /** Return exams owned by this teacher OR exams with no owner (created before auth was fixed) */
    @Query("SELECT e FROM Exam e WHERE e.createdByTeacherId = :tid OR e.createdByTeacherId IS NULL ORDER BY e.createdAt DESC")
    List<Exam> findByTeacherIdOrUnowned(@Param("tid") Long teacherId);

    /** Return orphaned exams with no teacher assigned */
    List<Exam> findByCreatedByTeacherIdIsNull();
}
