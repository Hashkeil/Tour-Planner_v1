package com.tourplanner.backend.bl.service;

import com.tourplanner.backend.bl.dto.TourLogCreateDto;
import com.tourplanner.backend.bl.dto.TourLogDto;
import com.tourplanner.backend.bl.dto.TourLogUpdateDto;
import com.tourplanner.backend.bl.exception.TourLogNotFoundException;
import com.tourplanner.backend.bl.exception.TourNotFoundException;
import com.tourplanner.backend.dal.entity.TourEntity;
import com.tourplanner.backend.dal.entity.TourLogEntity;
import com.tourplanner.backend.dal.entity.UserEntity;
import com.tourplanner.backend.dal.repository.TourLogRepository;
import com.tourplanner.backend.dal.repository.TourRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TourLogServiceTest {

    @Mock TourLogRepository tourLogRepository;
    @Mock TourRepository tourRepository;
    @InjectMocks TourLogService tourLogService;

    private TourEntity tour;
    private TourLogEntity log;

    @BeforeEach
    void setUp() {
        UserEntity user = new UserEntity();
        user.setId(1L);

        tour = TourEntity.builder()
                .id(1L).user(user).name("Trail Run")
                .fromLocation("Vienna").toLocation("Baden")
                .transportType("foot").build();

        log = TourLogEntity.builder()
                .id(1L).tour(tour)
                .dateTime(LocalDateTime.of(2026, 6, 15, 8, 30))
                .comment("Great weather, tough climb")
                .difficulty(4).distance(12.5)
                .totalTime(95).rating(4.5)
                .createdAt(LocalDateTime.now())
                .modifiedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void getLogsForTour_returnsAllLogsForTour() {
        when(tourLogRepository.findByTourId(1L)).thenReturn(List.of(log));

        List<TourLogDto> result = tourLogService.getLogsForTour(1L, 1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).comment()).isEqualTo("Great weather, tough climb");
        assertThat(result.get(0).rating()).isEqualTo(4.5);
    }

    @Test
    void getLogsForTour_returnsEmptyList_whenNoLogsExist() {
        when(tourLogRepository.findByTourId(99L)).thenReturn(List.of());

        List<TourLogDto> result = tourLogService.getLogsForTour(99L, 1L);

        assertThat(result).isEmpty();
    }

    @Test
    void createLog_throwsTourNotFoundException_whenTourNotOwnedByUser() {
        TourLogCreateDto dto = new TourLogCreateDto(
                99L, LocalDateTime.now(), "note", 3, 10.0, 60, 3.0);
        when(tourRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tourLogService.createLog(dto, 1L))
                .isInstanceOf(TourNotFoundException.class);

        verify(tourLogRepository, never()).save(any());
    }

    @Test
    void createLog_savesAndReturnsDto() {
        TourLogCreateDto dto = new TourLogCreateDto(
                1L, LocalDateTime.now(), "Nice day", 2, 8.0, 50, 4.0);
        when(tourRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(tour));
        when(tourLogRepository.save(any(TourLogEntity.class))).thenReturn(log);

        TourLogDto result = tourLogService.createLog(dto, 1L);

        assertThat(result).isNotNull();
        assertThat(result.tourId()).isEqualTo(1L);
        verify(tourLogRepository).save(any(TourLogEntity.class));
    }

    @Test
    void updateLog_throwsLogNotFoundException_whenLogNotFound() {
        TourLogUpdateDto dto = new TourLogUpdateDto(null, "New comment", null, null, null, null);
        when(tourLogRepository.findByIdAndTourUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tourLogService.updateLog(99L, dto, 1L))
                .isInstanceOf(TourLogNotFoundException.class);
    }

    @Test
    void updateLog_savesUpdatedLogAndReturnsDto() {
        TourLogUpdateDto dto = new TourLogUpdateDto(null, "Updated comment", 5, null, null, 5.0);
        when(tourLogRepository.findByIdAndTourUserId(1L, 1L)).thenReturn(Optional.of(log));
        when(tourLogRepository.save(any())).thenReturn(log);

        TourLogDto result = tourLogService.updateLog(1L, dto, 1L);

        assertThat(result).isNotNull();
        verify(tourLogRepository).save(log);
    }

    @Test
    void deleteLog_throwsLogNotFoundException_whenLogNotFound() {
        when(tourLogRepository.findByIdAndTourUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tourLogService.deleteLog(99L, 1L))
                .isInstanceOf(TourLogNotFoundException.class);

        verify(tourLogRepository, never()).delete(any());
    }

    @Test
    void deleteLog_deletesLog_whenFound() {
        when(tourLogRepository.findByIdAndTourUserId(1L, 1L)).thenReturn(Optional.of(log));

        tourLogService.deleteLog(1L, 1L);

        verify(tourLogRepository).delete(log);
    }

    @Test
    void getStats_returnsCorrectAggregates() {
        when(tourLogRepository.countByTourId(1L)).thenReturn(3L);
        when(tourLogRepository.getAverageRatingByTourId(1L)).thenReturn(4.2);
        when(tourLogRepository.getAverageDifficultyByTourId(1L)).thenReturn(3.5);

        var stats = tourLogService.getStats(1L, 1L);

        assertThat((Long) stats.get("count")).isEqualTo(3L);
        assertThat((Double) stats.get("avgRating")).isEqualTo(4.2);
        assertThat((Double) stats.get("avgDifficulty")).isEqualTo(3.5);
    }
}
