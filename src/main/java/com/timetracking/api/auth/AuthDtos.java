package com.timetracking.api.auth;

import com.timetracking.api.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {
    }

    public record LoginResponse(
            String token,
            String tokenType,
            long expiresInMs) {
    }

    public record RegisterRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6) String password,
            @NotNull Role role) {
    }

    public record UserResponse(
            Long id,
            String name,
            String email,
            Role role,
            Instant createdAt) {
    }
}
