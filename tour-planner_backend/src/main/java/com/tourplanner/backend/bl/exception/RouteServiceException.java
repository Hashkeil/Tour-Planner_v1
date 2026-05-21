package com.tourplanner.backend.bl.exception;

public class RouteServiceException extends RuntimeException {
    public RouteServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
