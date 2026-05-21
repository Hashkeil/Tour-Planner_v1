package com.tourplanner.backend.bl.dto;

import java.time.LocalDateTime;

public record TourLogUpdateDto(
        LocalDateTime dateTime,
        String comment,
        Integer difficulty,
        Double distance,
        Integer totalTime,
        Double rating
) {}
