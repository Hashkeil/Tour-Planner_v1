package com.tourplanner.backend.bl.dto;

public record RouteInfoDto(
        double distanceKm,
        int durationMin,
        String geometry
) {}
