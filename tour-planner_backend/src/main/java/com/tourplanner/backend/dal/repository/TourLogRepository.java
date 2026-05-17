package com.tourplanner.backend.dal.repository;

import com.tourplanner.backend.dal.entity.TourLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourLogRepository extends JpaRepository<TourLogEntity, Long> {

    List<TourLogEntity> findByTourId(Long tourId);

    Optional<TourLogEntity> findByIdAndTourUserId(Long id, Long userId);

    long countByTourId(Long tourId);

    @Query("SELECT AVG(l.rating) FROM TourLogEntity l WHERE l.tour.id = :tourId")
    Double getAverageRatingByTourId(@Param("tourId") Long tourId);

    @Query("SELECT AVG(l.difficulty) FROM TourLogEntity l WHERE l.tour.id = :tourId")
    Double getAverageDifficultyByTourId(@Param("tourId") Long tourId);
}
