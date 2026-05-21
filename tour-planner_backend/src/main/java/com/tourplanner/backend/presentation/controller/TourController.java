package com.tourplanner.backend.presentation.controller;

import com.tourplanner.backend.bl.dto.TourCreateDto;
import com.tourplanner.backend.bl.dto.TourDto;
import com.tourplanner.backend.bl.dto.TourUpdateDto;
import com.tourplanner.backend.bl.service.TourService;
import com.tourplanner.backend.dal.entity.UserEntity;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
// TourCreateDto already imported via bl.dto.*

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
@Validated
public class TourController {

    private final TourService tourService;

    @GetMapping
    public ResponseEntity<List<TourDto>> getAll(Authentication auth) {
        return ResponseEntity.ok(tourService.getAllTours(currentUser(auth).getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourDto> getById(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(tourService.getTourById(id, currentUser(auth).getId()));
    }

    @PostMapping
    public ResponseEntity<TourDto> create(@Valid @RequestBody TourCreateDto dto, Authentication auth) {
        UserEntity user = currentUser(auth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tourService.createTour(dto, user.getId(), user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TourDto> update(@PathVariable Long id,
                                          @Valid @RequestBody TourUpdateDto dto,
                                          Authentication auth) {
        return ResponseEntity.ok(tourService.updateTour(id, dto, currentUser(auth).getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        tourService.deleteTour(id, currentUser(auth).getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<TourDto>> search(@RequestParam String q, Authentication auth) {
        return ResponseEntity.ok(tourService.searchTours(q, currentUser(auth).getId()));
    }

    @GetMapping("/export")
    public ResponseEntity<String> export(Authentication auth) {
        String json = tourService.exportToJson(currentUser(auth).getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"tours.json\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(json);
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Integer>> importTours(@RequestBody List<TourCreateDto> dtos,
                                                            Authentication auth) {
        UserEntity user = currentUser(auth);
        int count = tourService.importTours(dtos, user.getId(), user);
        return ResponseEntity.ok(Map.of("imported", count));
    }

    private UserEntity currentUser(Authentication auth) {
        return (UserEntity) auth.getPrincipal();
    }
}
