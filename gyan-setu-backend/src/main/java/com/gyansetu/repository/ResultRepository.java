package com.gyansetu.repository;

import com.gyansetu.model.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ResultRepository extends JpaRepository<Result, Long> {

    @Query("SELECT r FROM Result r WHERE r.studentId = :studentId")
    List<Result> findByStudentId(@Param("studentId") Long studentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Result r WHERE r.studentId = :studentId")
    void deleteByStudentId(@Param("studentId") Long studentId);
}
