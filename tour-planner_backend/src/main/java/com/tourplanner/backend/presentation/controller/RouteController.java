package com.tourplanner.backend.presentation.controller;

import com.tourplanner.backend.bl.dto.RouteInfoDto;
import com.tourplanner.backend.bl.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/route")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    @GetMapping
    public ResponseEntity<RouteInfoDto> getRoute(@RequestParam String from,
                                                 @RequestParam String to,
                                                 @RequestParam String type) {
        return ResponseEntity.ok(routeService.getRoute(from, to, type));
    }
}
