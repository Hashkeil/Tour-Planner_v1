package com.tourplanner.backend.bl.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tourplanner.backend.bl.dto.TourCreateDto;
import com.tourplanner.backend.bl.dto.TourDto;
import com.tourplanner.backend.bl.dto.TourUpdateDto;
import com.tourplanner.backend.bl.exception.TourNotFoundException;
import com.tourplanner.backend.dal.entity.TourEntity;
import com.tourplanner.backend.dal.entity.UserEntity;
import com.tourplanner.backend.dal.repository.TourLogRepository;
import com.tourplanner.backend.dal.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TourService {

    private static final Logger log = LoggerFactory.getLogger(TourService.class);

    private final TourRepository tourRepository;
    private final TourLogRepository tourLogRepository;
    private final ObjectMapper objectMapper;

    public List<TourDto> getAllTours(Long userId) {
        return tourRepository.findByUserId(userId).stream().map(this::toDto).toList();
    }

    public TourDto getTourById(Long id, Long userId) {
        return toDto(findOwned(id, userId));
    }

    public TourDto createTour(TourCreateDto dto, Long userId, UserEntity user) {
        log.info("Creating tour '{}' for user {}", dto.name(), userId);
        TourEntity tour = TourEntity.builder()
                .user(user)
                .name(dto.name())
                .description(dto.description())
                .fromLocation(dto.fromLocation())
                .toLocation(dto.toLocation())
                .transportType(dto.transportType())
                .distance(dto.distance())
                .estimatedTime(dto.estimatedTime())
                .routeGeometry(dto.routeGeometry())
                .imagePath(dto.imagePath())
                .createdAt(LocalDateTime.now())
                .modifiedAt(LocalDateTime.now())
                .build();
        return toDto(tourRepository.save(tour));
    }

    public TourDto updateTour(Long id, TourUpdateDto dto, Long userId) {
        TourEntity tour = findOwned(id, userId);
        if (dto.name()          != null) tour.setName(dto.name());
        if (dto.description()   != null) tour.setDescription(dto.description());
        if (dto.fromLocation()  != null) tour.setFromLocation(dto.fromLocation());
        if (dto.toLocation()    != null) tour.setToLocation(dto.toLocation());
        if (dto.transportType() != null) tour.setTransportType(dto.transportType());
        if (dto.distance()      != null) tour.setDistance(dto.distance());
        if (dto.estimatedTime() != null) tour.setEstimatedTime(dto.estimatedTime());
        if (dto.routeGeometry() != null) tour.setRouteGeometry(dto.routeGeometry());
        if (dto.imagePath()     != null) tour.setImagePath(dto.imagePath());
        tour.setModifiedAt(LocalDateTime.now());
        return toDto(tourRepository.save(tour));
    }

    public void deleteTour(Long id, Long userId) {
        log.info("Deleting tour {} for user {}", id, userId);
        tourRepository.delete(findOwned(id, userId));
    }

    public List<TourDto> searchTours(String q, Long userId) {
        return tourRepository.searchByUserIdAndQuery(userId, q).stream().map(this::toDto).toList();
    }

    public String exportToJson(Long userId) {
        try {
            log.info("Exporting tours for user {}", userId);
            return objectMapper.writeValueAsString(getAllTours(userId));
        } catch (Exception e) {
            log.error("Export failed for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Export failed", e);
        }
    }

    public int importTours(List<TourCreateDto> dtos, Long userId, UserEntity user) {
        dtos.forEach(dto -> createTour(dto, userId, user));
        return dtos.size();
    }

    private TourEntity findOwned(Long id, Long userId) {
        return tourRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new TourNotFoundException(id));
    }

    private TourDto toDto(TourEntity t) {
        int popularity       = (int) tourLogRepository.countByTourId(t.getId());
        Double avgRating     = tourLogRepository.getAverageRatingByTourId(t.getId());
        Double avgDifficulty = tourLogRepository.getAverageDifficultyByTourId(t.getId());
        int childFriendly    = avgDifficulty != null ? (int) Math.round(6 - avgDifficulty) : 5;
        return new TourDto(
                t.getId(), t.getName(), t.getDescription(),
                t.getFromLocation(), t.getToLocation(), t.getTransportType(),
                t.getDistance(), t.getEstimatedTime(),
                popularity, childFriendly,
                avgRating, t.getImagePath(), t.getRouteGeometry(),
                t.getCreatedAt(), t.getModifiedAt()
        );
    }
}
