package com.tourplanner.backend.presentation.controller;

import com.tourplanner.backend.bl.dto.TourLogCreateDto;
import com.tourplanner.backend.bl.dto.TourLogDto;
import com.tourplanner.backend.bl.dto.TourLogUpdateDto;
import com.tourplanner.backend.bl.service.TourLogService;
import com.tourplanner.backend.dal.entity.UserEntity;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class TourLogController {

    private final TourLogService tourLogService;

    @GetMapping("/api/tours/{tourId}/logs")
    public ResponseEntity<List<TourLogDto>> getLogsForTour(@PathVariable Long tourId,
                                                           Authentication auth) {
        return ResponseEntity.ok(tourLogService.getLogsForTour(tourId, currentUser(auth).getId()));
    }

    @GetMapping("/api/tours/{tourId}/logs/stats")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long tourId,
                                                        Authentication auth) {
        return ResponseEntity.ok(tourLogService.getStats(tourId, currentUser(auth).getId()));
    }

    @PostMapping("/api/tourlogs")
    public ResponseEntity<TourLogDto> create(@Valid @RequestBody TourLogCreateDto dto,
                                             Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tourLogService.createLog(dto, currentUser(auth).getId()));
    }

    @PutMapping("/api/tourlogs/{id}")
    public ResponseEntity<TourLogDto> update(@PathVariable Long id,
                                             @Valid @RequestBody TourLogUpdateDto dto,
                                             Authentication auth) {
        return ResponseEntity.ok(tourLogService.updateLog(id, dto, currentUser(auth).getId()));
    }

    @DeleteMapping("/api/tourlogs/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        tourLogService.deleteLog(id, currentUser(auth).getId());
        return ResponseEntity.noContent().build();
    }

    private UserEntity currentUser(Authentication auth) {
        return (UserEntity) auth.getPrincipal();
    }
}
