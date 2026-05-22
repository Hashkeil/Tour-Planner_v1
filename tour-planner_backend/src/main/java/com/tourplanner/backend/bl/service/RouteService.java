package com.tourplanner.backend.bl.service;

import com.tourplanner.backend.bl.dto.RouteInfoDto;
import com.tourplanner.backend.bl.exception.RouteServiceException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class RouteService {

    @Value("${app.ors.base-url}")
    private String orsBaseUrl;

    @Value("${app.ors.api-key}")
    private String orsApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public RouteInfoDto getRoute(String from, String to, String type) {
        try {
            String profile = switch (type.toLowerCase()) {
                case "car"     -> "driving-car";
                case "bicycle" -> "cycling-regular";
                case "foot"    -> "foot-walking";
                default        -> "driving-car";
            };

            String url = orsBaseUrl + "/v2/directions/" + profile
                    + "?api_key=" + orsApiKey
                    + "&start=" + from
                    + "&end=" + to;

            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(url, String.class);

            JsonNode root     = objectMapper.readTree(response);
            JsonNode features = root.path("features").get(0);
            JsonNode summary  = features.path("properties").path("summary");
            String   geometry = features.path("geometry").toString();

            double distanceKm  = summary.path("distance").asDouble() / 1000.0;
            int    durationMin = (int) (summary.path("duration").asDouble() / 60.0);

            return new RouteInfoDto(distanceKm, durationMin, geometry);
        } catch (Exception e) {
            throw new RouteServiceException("Failed to fetch route: " + e.getMessage(), e);
        }
    }
}
