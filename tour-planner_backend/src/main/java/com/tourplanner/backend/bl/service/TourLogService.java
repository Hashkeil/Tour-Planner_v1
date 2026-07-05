package com.tourplanner.backend.bl.service;

import com.tourplanner.backend.bl.dto.TourLogCreateDto;
import com.tourplanner.backend.bl.dto.TourLogDto;
import com.tourplanner.backend.bl.dto.TourLogUpdateDto;
import com.tourplanner.backend.bl.exception.TourLogNotFoundException;
import com.tourplanner.backend.bl.exception.TourNotFoundException;
import com.tourplanner.backend.dal.entity.TourLogEntity;
import com.tourplanner.backend.dal.repository.TourLogRepository;
import com.tourplanner.backend.dal.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TourLogService {

    private static final Logger log = LoggerFactory.getLogger(TourLogService.class);

    private final TourLogRepository tourLogRepository;
    private final TourRepository tourRepository;

    public List<TourLogDto> getLogsForTour(Long tourId, Long userId) {
        assertTourOwnedByUser(tourId, userId);
        return tourLogRepository.findByTourId(tourId).stream().map(this::toDto).toList();
    }

    public Map<String, Object> getStats(Long tourId, Long userId) {
        assertTourOwnedByUser(tourId, userId);
        Map<String, Object> stats = new HashMap<>();
        stats.put("count",       tourLogRepository.countByTourId(tourId));
        stats.put("avgRating",   tourLogRepository.getAverageRatingByTourId(tourId));
        stats.put("avgDifficulty", tourLogRepository.getAverageDifficultyByTourId(tourId));
        return stats;
    }

    private void assertTourOwnedByUser(Long tourId, Long userId) {
        if (tourRepository.findByIdAndUserId(tourId, userId).isEmpty()) {
            throw new TourNotFoundException(tourId);
        }
    }

    public TourLogDto createLog(TourLogCreateDto dto, Long userId) {
        log.info("Creating log for tour {} by user {}", dto.tourId(), userId);
        var tour = tourRepository.findByIdAndUserId(dto.tourId(), userId)
                .orElseThrow(() -> new TourNotFoundException(dto.tourId()));
        TourLogEntity log = TourLogEntity.builder()
                .tour(tour)
                .dateTime(dto.dateTime())
                .comment(dto.comment())
                .difficulty(dto.difficulty())
                .distance(dto.distance())
                .totalTime(dto.totalTime())
                .rating(dto.rating())
                .createdAt(LocalDateTime.now())
                .modifiedAt(LocalDateTime.now())
                .build();
        return toDto(tourLogRepository.save(log));
    }

    public TourLogDto updateLog(Long id, TourLogUpdateDto dto, Long userId) {
        TourLogEntity log = tourLogRepository.findByIdAndTourUserId(id, userId)
                .orElseThrow(() -> new TourLogNotFoundException(id));
        if (dto.dateTime()   != null) log.setDateTime(dto.dateTime());
        if (dto.comment()    != null) log.setComment(dto.comment());
        if (dto.difficulty() != null) log.setDifficulty(dto.difficulty());
        if (dto.distance()   != null) log.setDistance(dto.distance());
        if (dto.totalTime()  != null) log.setTotalTime(dto.totalTime());
        if (dto.rating()     != null) log.setRating(dto.rating());
        log.setModifiedAt(LocalDateTime.now());
        return toDto(tourLogRepository.save(log));
    }

    public void deleteLog(Long id, Long userId) {
        log.info("Deleting log {} for user {}", id, userId);
        TourLogEntity logEntity = tourLogRepository.findByIdAndTourUserId(id, userId)
                .orElseThrow(() -> new TourLogNotFoundException(id));
        tourLogRepository.delete(logEntity);
    }

    private TourLogDto toDto(TourLogEntity l) {
        return new TourLogDto(
                l.getId(), l.getTour().getId(),
                l.getDateTime(), l.getComment(),
                l.getDifficulty(), l.getDistance(),
                l.getTotalTime(), l.getRating(),
                l.getCreatedAt(), l.getModifiedAt()
        );
    }
}
