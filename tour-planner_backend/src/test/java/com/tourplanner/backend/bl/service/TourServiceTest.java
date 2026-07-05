package com.tourplanner.backend.bl.service;

import com.tourplanner.backend.bl.dto.TourCreateDto;
import com.tourplanner.backend.bl.dto.TourDto;
import com.tourplanner.backend.bl.dto.TourUpdateDto;
import com.tourplanner.backend.bl.exception.TourNotFoundException;
import com.tourplanner.backend.dal.entity.TourEntity;
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
class TourServiceTest {

    @Mock TourRepository tourRepository;
    @Mock TourLogRepository tourLogRepository;
    @InjectMocks TourService tourService;

    private UserEntity user;
    private TourEntity tour;

    @BeforeEach
    void setUp() {
        user = new UserEntity();
        user.setId(1L);
        user.setEmail("user@example.com");
        user.setUsername("testuser");

        tour = TourEntity.builder()
                .id(1L).user(user)
                .name("Alpine Hike").description("Beautiful mountain tour")
                .fromLocation("Salzburg").toLocation("Innsbruck")
                .transportType("foot").distance(45.0).estimatedTime(600)
                .createdAt(LocalDateTime.now()).modifiedAt(LocalDateTime.now())
                .build();

        lenient().when(tourLogRepository.countByTourId(any())).thenReturn(0L);
        lenient().when(tourLogRepository.getAverageRatingByTourId(any())).thenReturn(null);
        lenient().when(tourLogRepository.getAverageDifficultyByTourId(any())).thenReturn(null);
    }

    @Test
    void getAllTours_returnsAllToursForUser() {
        when(tourRepository.findByUserId(1L)).thenReturn(List.of(tour));

        List<TourDto> result = tourService.getAllTours(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Alpine Hike");
        assertThat(result.get(0).fromLocation()).isEqualTo("Salzburg");
    }

    @Test
    void getAllTours_returnsEmptyList_whenUserHasNoTours() {
        when(tourRepository.findByUserId(2L)).thenReturn(List.of());

        List<TourDto> result = tourService.getAllTours(2L);

        assertThat(result).isEmpty();
    }

    @Test
    void getTourById_returnsCorrectTour() {
        when(tourRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(tour));

        TourDto result = tourService.getTourById(1L, 1L);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.name()).isEqualTo("Alpine Hike");
        assertThat(result.toLocation()).isEqualTo("Innsbruck");
    }

    @Test
    void getTourById_throwsTourNotFoundException_whenTourDoesNotExist() {
        when(tourRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tourService.getTourById(99L, 1L))
                .isInstanceOf(TourNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void createTour_savesAndReturnsTourDto() {
        TourCreateDto dto = new TourCreateDto("City Ride", "Urban cycling", "Vienna", "Graz",
                "bicycle", 200.0, 480, null, null);
        TourEntity saved = TourEntity.builder()
                .id(2L).user(user).name("City Ride").description("Urban cycling")
                .fromLocation("Vienna").toLocation("Graz").transportType("bicycle")
                .distance(200.0).estimatedTime(480)
                .createdAt(LocalDateTime.now()).modifiedAt(LocalDateTime.now())
                .build();
        when(tourRepository.save(any(TourEntity.class))).thenReturn(saved);

        TourDto result = tourService.createTour(dto, 1L, user);

        assertThat(result.name()).isEqualTo("City Ride");
        assertThat(result.distance()).isEqualTo(200.0);
        verify(tourRepository).save(any(TourEntity.class));
    }

    @Test
    void updateTour_throwsTourNotFoundException_whenTourDoesNotExist() {
        when(tourRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());
        TourUpdateDto dto = new TourUpdateDto("New Name", null, null, null, null, null, null, null, null);

        assertThatThrownBy(() -> tourService.updateTour(99L, dto, 1L))
                .isInstanceOf(TourNotFoundException.class);
    }

    @Test
    void updateTour_updatesNameWhenProvided() {
        when(tourRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(tour));
        TourUpdateDto dto = new TourUpdateDto("Renamed Tour", null, null, null, null, null, null, null, null);
        TourEntity renamed = TourEntity.builder()
                .id(1L).user(user).name("Renamed Tour")
                .fromLocation("Salzburg").toLocation("Innsbruck").transportType("foot")
                .createdAt(LocalDateTime.now()).modifiedAt(LocalDateTime.now())
                .build();
        when(tourRepository.save(any())).thenReturn(renamed);

        TourDto result = tourService.updateTour(1L, dto, 1L);

        assertThat(result.name()).isEqualTo("Renamed Tour");
    }

    @Test
    void deleteTour_callsRepositoryDelete() {
        when(tourRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(tour));

        tourService.deleteTour(1L, 1L);

        verify(tourRepository).delete(tour);
    }

    @Test
    void deleteTour_throwsTourNotFoundException_whenTourDoesNotExist() {
        when(tourRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tourService.deleteTour(99L, 1L))
                .isInstanceOf(TourNotFoundException.class);
    }

    @Test
    void computedAttribute_popularity_equalsLogCount() {
        when(tourRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(tour));
        when(tourLogRepository.countByTourId(1L)).thenReturn(7L);

        TourDto result = tourService.getTourById(1L, 1L);

        assertThat(result.popularity()).isEqualTo(7);
    }

    @Test
    void computedAttribute_childFriendliness_isMaxWhenNoLogs() {
        when(tourRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(tour));
        when(tourLogRepository.getAverageDifficultyByTourId(1L)).thenReturn(null);

        TourDto result = tourService.getTourById(1L, 1L);

        assertThat(result.childFriendliness()).isEqualTo(5);
    }

    @Test
    void computedAttribute_childFriendliness_decreasesWithDifficulty() {
        when(tourRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(tour));
        when(tourLogRepository.getAverageDifficultyByTourId(1L)).thenReturn(3.0);

        TourDto result = tourService.getTourById(1L, 1L);

        assertThat(result.childFriendliness()).isEqualTo(3); // 6 - 3
    }

    @Test
    void searchTours_returnsMatchingResults() {
        when(tourRepository.searchByUserIdAndQuery(1L, "alpine")).thenReturn(List.of(tour));

        List<TourDto> result = tourService.searchTours("alpine", 1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Alpine Hike");
    }
}
