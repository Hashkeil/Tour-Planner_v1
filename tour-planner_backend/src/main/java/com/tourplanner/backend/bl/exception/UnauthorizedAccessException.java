package com.tourplanner.backend.bl.exception;

public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException() {
        super("Access denied to this resource");
    }
}
