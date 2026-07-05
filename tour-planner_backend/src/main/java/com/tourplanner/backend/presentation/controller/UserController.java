package com.tourplanner.backend.presentation.controller;

import com.tourplanner.backend.bl.dto.ChangePasswordDto;
import com.tourplanner.backend.bl.dto.ProfileDto;
import com.tourplanner.backend.bl.dto.UpdateProfileDto;
import com.tourplanner.backend.bl.service.AuthService;
import com.tourplanner.backend.dal.entity.UserEntity;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @PutMapping
    public ResponseEntity<ProfileDto> updateProfile(@Valid @RequestBody UpdateProfileDto dto,
                                                     Authentication auth) {
        return ResponseEntity.ok(authService.updateProfile(currentUser(auth), dto));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordDto dto,
                                               Authentication auth) {
        authService.changePassword(currentUser(auth), dto);
        return ResponseEntity.noContent().build();
    }

    private UserEntity currentUser(Authentication auth) {
        return (UserEntity) auth.getPrincipal();
    }
}
