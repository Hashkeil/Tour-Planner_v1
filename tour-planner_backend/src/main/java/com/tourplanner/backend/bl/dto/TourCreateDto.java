package com.tourplanner.backend.bl.dto;

import jakarta.validation.constraints.NotBlank;

public record TourCreateDto(
        @NotBlank String name,
        String description,
        @NotBlank String fromLocation,
        @NotBlank String toLocation,
        @NotBlank String transportType,
        Double distance,
        Integer estimatedTime,
        String routeGeometry
) {}
