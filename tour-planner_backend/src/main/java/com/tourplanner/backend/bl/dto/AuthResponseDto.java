package com.tourplanner.backend.bl.dto;

import java.time.LocalDateTime;

public record AuthResponseDto(
        String token,
        String username,
        String email,
        LocalDateTime expiresAt
) {}
