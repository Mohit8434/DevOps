package com.todo.backend.repository;

import com.todo.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<Task> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, String status);
    
    @Transactional
    @Modifying
    @Query("DELETE FROM Task t WHERE t.userId = :userId AND t.status = 'COMPLETED'")
    void deleteCompletedTasksByUserId(@Param("userId") String userId);
}
