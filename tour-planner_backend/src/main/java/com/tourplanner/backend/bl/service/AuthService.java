package com.tourplanner.backend.bl.service;

import com.tourplanner.backend.bl.dto.AuthResponseDto;
import com.tourplanner.backend.bl.dto.UserLoginDto;
import com.tourplanner.backend.bl.dto.UserRegisterDto;
import com.tourplanner.backend.bl.exception.EmailAlreadyExistsException;
import com.tourplanner.backend.bl.exception.InvalidCredentialsException;
import com.tourplanner.backend.config.JwtUtil;
import com.tourplanner.backend.dal.entity.UserEntity;
import com.tourplanner.backend.dal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponseDto register(UserRegisterDto dto) {
        if (userRepository.existsByEmail(dto.email())) {
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
        UserEntity user = userRepository.findByEmail(dto.email())
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(dto.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponseDto(token, user.getUsername(), user.getEmail(), jwtUtil.expiresAt(token));
    }
}
