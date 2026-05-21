package com.tourplanner.backend.bl.exception;

public class TourLogNotFoundException extends RuntimeException {
    public TourLogNotFoundException(Long id) {
        super("Tour log not found: " + id);
    }
}
