package com.tourplanner.backend.bl.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserLoginDto(
        @NotBlank @Email String email,
        @NotBlank String password
) {}
