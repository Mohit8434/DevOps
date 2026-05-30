package com.todo.backend.controller;

import com.todo.backend.model.Task;
import com.todo.backend.repository.TaskRepository;
import com.todo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    // Create a new task
    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Task task) {
        if (task.getUserId() == null || task.getUserId().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("User ID is required for creating a task");
        }
        if (task.getTitle() == null || task.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Task title cannot be empty");
        }
        
        // Check if user exists
        if (!userRepository.existsById(task.getUserId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        task.setTitle(task.getTitle().trim());
        if (task.getNotes() != null) {
            task.setNotes(task.getNotes().trim());
        }
        task.setCreatedAt(LocalDateTime.now());
        task.setStatus("PENDING");
        task.setCompletedAt(null);

        Task savedTask = taskRepository.save(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);
    }

    // Get tasks for a user, optionally filtered by status (PENDING / COMPLETED)
    @GetMapping
    public ResponseEntity<?> getTasks(@RequestParam String userId, @RequestParam(required = false) String status) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        List<Task> tasks;
        if (status != null && !status.trim().isEmpty()) {
            tasks = taskRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status.toUpperCase());
        } else {
            tasks = taskRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return ResponseEntity.ok(tasks);
    }

    // Toggle task status (PENDING <-> COMPLETED)
    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleTaskStatus(@PathVariable Long id) {
        Optional<Task> taskOpt = taskRepository.findById(id);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found");
        }

        Task task = taskOpt.get();
        if ("PENDING".equals(task.getStatus())) {
            task.setStatus("COMPLETED");
            task.setCompletedAt(LocalDateTime.now());
        } else {
            task.setStatus("PENDING");
            task.setCompletedAt(null);
        }

        Task updatedTask = taskRepository.save(task);
        return ResponseEntity.ok(updatedTask);
    }

    // Update an existing task
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody Task updatedTaskData) {
        Optional<Task> taskOpt = taskRepository.findById(id);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found");
        }

        Task task = taskOpt.get();
        if (updatedTaskData.getTitle() != null && !updatedTaskData.getTitle().trim().isEmpty()) {
            task.setTitle(updatedTaskData.getTitle().trim());
        }
        if (updatedTaskData.getNotes() != null) {
            task.setNotes(updatedTaskData.getNotes().trim());
        }
        if (updatedTaskData.getPriority() != null) {
            task.setPriority(updatedTaskData.getPriority());
        }
        if (updatedTaskData.getCategory() != null) {
            task.setCategory(updatedTaskData.getCategory());
        }
        if (updatedTaskData.getDueDate() != null) {
            task.setDueDate(updatedTaskData.getDueDate());
        }

        Task savedTask = taskRepository.save(task);
        return ResponseEntity.ok(savedTask);
    }

    // Delete a single task
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        if (!taskRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found");
        }
        taskRepository.deleteById(id);
        return ResponseEntity.ok().body("Task deleted successfully");
    }

    // Clear history (delete all completed tasks for a user)
    @DeleteMapping("/history")
    public ResponseEntity<?> clearHistory(@RequestParam String userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        taskRepository.deleteCompletedTasksByUserId(userId);
        return ResponseEntity.ok().body("Completed tasks history cleared successfully");
    }
}
