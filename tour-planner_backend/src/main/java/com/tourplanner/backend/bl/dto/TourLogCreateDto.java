package com.tourplanner.backend.bl.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record TourLogCreateDto(
        @NotNull Long tourId,
        @NotNull LocalDateTime dateTime,
        String comment,
        @NotNull @Min(1) @Max(5) Integer difficulty,
        @NotNull @Positive Double distance,
        @NotNull @Positive Integer totalTime,
        @NotNull @DecimalMin("1.0") @DecimalMax("5.0") Double rating
) {}
