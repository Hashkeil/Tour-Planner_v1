package com.tourplanner.backend.bl.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRegisterDto(
        @NotBlank @Email String email,
        @NotBlank String username,
        @NotBlank @Size(min = 6) String password
) {}
