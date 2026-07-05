package com.tourplanner.backend.bl.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordDto(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 6) String newPassword
) {}
