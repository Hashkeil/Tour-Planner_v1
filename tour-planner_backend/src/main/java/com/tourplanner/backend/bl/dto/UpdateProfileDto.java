package com.tourplanner.backend.bl.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileDto(
        @NotBlank @Size(min = 3) String username
) {}
