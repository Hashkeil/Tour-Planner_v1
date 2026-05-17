package com.tourplanner.backend.dal.repository;

import com.tourplanner.backend.dal.entity.TourEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourRepository extends JpaRepository<TourEntity, Long> {

    List<TourEntity> findByUserId(Long userId);

    Optional<TourEntity> findByIdAndUserId(Long id, Long userId);

    @Query("""
        SELECT DISTINCT t FROM TourEntity t
        LEFT JOIN t.tourLogs l
        WHERE t.user.id = :userId AND (
            LOWER(t.name)          LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(t.description)   LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(t.fromLocation)  LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(t.toLocation)    LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(t.transportType) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(l.comment)       LIKE LOWER(CONCAT('%', :q, '%'))
        )
        """)
    List<TourEntity> searchByUserIdAndQuery(
            @Param("userId") Long userId,
            @Param("q") String q
    );
}
