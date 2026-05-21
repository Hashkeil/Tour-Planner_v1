package com.tourplanner.backend.bl.dto;

import java.time.LocalDateTime;

public record TourLogDto(
        Long id,
        Long tourId,
        LocalDateTime dateTime,
        String comment,
        Integer difficulty,
        Double distance,
        Integer totalTime,
        Double rating,
        LocalDateTime createdAt,
        LocalDateTime modifiedAt
) {}
