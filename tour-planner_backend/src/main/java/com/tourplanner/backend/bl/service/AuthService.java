package com.tourplanner.backend.bl.service;

import com.tourplanner.backend.bl.dto.AuthResponseDto;
import com.tourplanner.backend.bl.dto.ChangePasswordDto;
import com.tourplanner.backend.bl.dto.ProfileDto;
import com.tourplanner.backend.bl.dto.UpdateProfileDto;
import com.tourplanner.backend.bl.dto.UserLoginDto;
import com.tourplanner.backend.bl.dto.UserRegisterDto;
import com.tourplanner.backend.bl.exception.EmailAlreadyExistsException;
import com.tourplanner.backend.bl.exception.InvalidCredentialsException;
import com.tourplanner.backend.config.JwtUtil;
import com.tourplanner.backend.dal.entity.UserEntity;
import com.tourplanner.backend.dal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponseDto register(UserRegisterDto dto) {
        log.info("Registration attempt for email: {}", dto.email());
        if (userRepository.existsByEmail(dto.email())) {
            log.warn("Registration failed — email already exists: {}", dto.email());
            throw new EmailAlreadyExistsException(dto.email());
        }
        UserEntity user = UserEntity.builder()
                .email(dto.email())
                .username(dto.username())
                .passwordHash(passwordEncoder.encode(dto.password()))
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponseDto(token, user.getUsername(), user.getEmail(), jwtUtil.expiresAt(token));
    }

    public AuthResponseDto login(UserLoginDto dto) {
        log.info("Login attempt for email: {}", dto.email());
        UserEntity user = userRepository.findByEmail(dto.email())
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(dto.password(), user.getPasswordHash())) {
            log.warn("Login failed — wrong password for email: {}", dto.email());
            throw new InvalidCredentialsException();
        }
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponseDto(token, user.getUsername(), user.getEmail(), jwtUtil.expiresAt(token));
    }

    public ProfileDto updateProfile(UserEntity user, UpdateProfileDto dto) {
        log.info("Updating profile for user {}", user.getId());
        user.setUsername(dto.username());
        userRepository.save(user);
        return new ProfileDto(user.getUsername(), user.getEmail());
    }

    public void changePassword(UserEntity user, ChangePasswordDto dto) {
        log.info("Password change attempt for user {}", user.getId());
        if (!passwordEncoder.matches(dto.currentPassword(), user.getPasswordHash())) {
            log.warn("Password change failed — wrong current password for user {}", user.getId());
            throw new InvalidCredentialsException();
        }
        user.setPasswordHash(passwordEncoder.encode(dto.newPassword()));
        userRepository.save(user);
    }
}
