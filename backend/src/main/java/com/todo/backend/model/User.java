package com.todo.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(name = "id", nullable = false, unique = true, length = 100)
    private String id;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public User() {
    }

    public User(String id) {
        this.id = id;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
