package com.todo.backend.controller;

import com.todo.backend.model.User;
import com.todo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("User ID cannot be empty");
        }
        
        userId = userId.trim();
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        } else {
            // Register user automatically (passwordless signup)
            User newUser = new User(userId);
            User savedUser = userRepository.save(newUser);
            return ResponseEntity.ok(savedUser);
        }
    }
}
