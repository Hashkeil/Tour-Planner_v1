package com.tourplanner.backend.bl.dto;

public record TourUpdateDto(
        String name,
        String description,
        String fromLocation,
        String toLocation,
        String transportType,
        Double distance,
        Integer estimatedTime,
        String routeGeometry,
        String imagePath
) {}
