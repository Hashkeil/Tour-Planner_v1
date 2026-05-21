package com.tourplanner.backend.bl.exception;

public class TourNotFoundException extends RuntimeException {
    public TourNotFoundException(Long id) {
        super("Tour not found with id: " + id);
    }
}
