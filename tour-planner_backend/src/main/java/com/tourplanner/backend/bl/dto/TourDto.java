package com.tourplanner.backend.bl.dto;

import java.time.LocalDateTime;

public record TourDto(
        Long id,
        String name,
        String description,
        String fromLocation,
        String toLocation,
        String transportType,
        Double distance,
        Integer estimatedTime,
        int popularity,
        int childFriendliness,
        Double avgRating,
        String imagePath,
        String routeGeometry,
        LocalDateTime createdAt,
        LocalDateTime modifiedAt
) {}
