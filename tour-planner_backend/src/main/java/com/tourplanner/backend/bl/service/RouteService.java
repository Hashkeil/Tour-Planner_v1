package com.tourplanner.backend.bl.service;

import com.tourplanner.backend.bl.dto.RouteInfoDto;
import com.tourplanner.backend.bl.exception.RouteServiceException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class RouteService {

    @Value("${app.ors.base-url}")
    private String orsBaseUrl;

    @Value("${app.ors.api-key}")
    private String orsApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public RouteInfoDto getRoute(String from, String to, String type) {
        try {
            String profile = switch (type.toLowerCase()) {
                case "car"     -> "driving-car";
                case "bicycle" -> "cycling-regular";
                case "foot"    -> "foot-walking";
                default        -> "driving-car";
            };

            String fromCoords = geocode(from);
            String toCoords   = geocode(to);

            String url = UriComponentsBuilder
                    .fromUriString(orsBaseUrl + "/v2/directions/" + profile)
                    .queryParam("api_key", orsApiKey)
                    .queryParam("start", fromCoords)
                    .queryParam("end", toCoords)
                    .build()
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);

            JsonNode root     = objectMapper.readTree(response);
            JsonNode features = root.path("features").get(0);
            JsonNode summary  = features.path("properties").path("summary");
            String   geometry = features.path("geometry").toString();

            double distanceKm  = summary.path("distance").asDouble() / 1000.0;
            int    durationMin = (int) (summary.path("duration").asDouble() / 60.0);

            return new RouteInfoDto(distanceKm, durationMin, geometry);
        } catch (RouteServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new RouteServiceException("Failed to fetch route: " + e.getMessage(), e);
        }
    }

    private String geocode(String place) {
        try {
            String url = UriComponentsBuilder
                    .fromUriString(orsBaseUrl + "/geocode/search")
                    .queryParam("api_key", orsApiKey)
                    .queryParam("text", place)
                    .queryParam("size", 1)
                    .build()
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode coords = root.path("features").get(0).path("geometry").path("coordinates");

            double lon = coords.get(0).asDouble();
            double lat = coords.get(1).asDouble();
            return lon + "," + lat;
        } catch (Exception e) {
            throw new RouteServiceException("Could not geocode location: " + place, e);
        }
    }
}
