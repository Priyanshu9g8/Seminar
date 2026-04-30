package com.gyansetu.repository;

import com.gyansetu.model.ExamSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamSubmissionRepository extends JpaRepository<ExamSubmission, Long> {
    List<ExamSubmission> findByStudentIdOrderBySubmittedAtDesc(Long studentId);
    List<ExamSubmission> findByExamIdOrderBySubmittedAtDesc(Long examId);
    List<ExamSubmission> findByExamIdAndStudentIdOrderBySubmittedAtDesc(Long examId, Long studentId);
    boolean existsByExamIdAndStudentId(Long examId, Long studentId);
    long countByExamId(Long examId);

    /** Count unique students who submitted a specific exam (ignores retakes) */
    @org.springframework.data.jpa.repository.Query(
        "SELECT COUNT(DISTINCT s.studentId) FROM ExamSubmission s WHERE s.examId = :examId")
    long countDistinctStudentsByExamId(@org.springframework.data.repository.query.Param("examId") Long examId);
    
    @Transactional
    void deleteByExamId(Long examId);
}
