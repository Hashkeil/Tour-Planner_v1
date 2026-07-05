package com.tourplanner.backend.bl.service;

import com.tourplanner.backend.bl.dto.AuthResponseDto;
import com.tourplanner.backend.bl.dto.UserLoginDto;
import com.tourplanner.backend.bl.dto.UserRegisterDto;
import com.tourplanner.backend.bl.exception.EmailAlreadyExistsException;
import com.tourplanner.backend.bl.exception.InvalidCredentialsException;
import com.tourplanner.backend.config.JwtUtil;
import com.tourplanner.backend.dal.entity.UserEntity;
import com.tourplanner.backend.dal.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @InjectMocks AuthService authService;

    private UserEntity existingUser;

    @BeforeEach
    void setUp() {
        existingUser = UserEntity.builder()
                .id(1L)
                .email("alice@example.com")
                .username("alice")
                .passwordHash("$2a$10$hashed_password")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void register_savesUserWithEncodedPassword() {
        UserRegisterDto dto = new UserRegisterDto("new@example.com", "newuser", "secret123");
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded_secret");
        when(jwtUtil.generateToken("new@example.com")).thenReturn("jwt.token.here");
        when(jwtUtil.expiresAt("jwt.token.here")).thenReturn(LocalDateTime.now().plusHours(1));

        UserEntity savedUser = UserEntity.builder()
                .id(2L).email("new@example.com").username("newuser")
                .passwordHash("encoded_secret").createdAt(LocalDateTime.now()).build();
        when(userRepository.save(any(UserEntity.class))).thenReturn(savedUser);

        authService.register(dto);

        verify(passwordEncoder).encode("secret123");
        verify(userRepository).save(argThat(u -> "encoded_secret".equals(u.getPasswordHash())));
    }

    @Test
    void register_returnsAuthResponseWithToken() {
        UserRegisterDto dto = new UserRegisterDto("bob@example.com", "bob", "password6");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hash");
        when(jwtUtil.generateToken(anyString())).thenReturn("my.jwt.token");
        when(jwtUtil.expiresAt("my.jwt.token")).thenReturn(LocalDateTime.now().plusHours(1));

        UserEntity saved = UserEntity.builder().id(3L).email("bob@example.com")
                .username("bob").passwordHash("hash").createdAt(LocalDateTime.now()).build();
        when(userRepository.save(any())).thenReturn(saved);

        AuthResponseDto result = authService.register(dto);

        assertThat(result.token()).isEqualTo("my.jwt.token");
        assertThat(result.username()).isEqualTo("bob");
        assertThat(result.email()).isEqualTo("bob@example.com");
    }

    @Test
    void register_throwsEmailAlreadyExistsException_whenEmailIsTaken() {
        UserRegisterDto dto = new UserRegisterDto("alice@example.com", "alice2", "password6");
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(dto))
                .isInstanceOf(EmailAlreadyExistsException.class);

        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void login_returnsAuthResponse_whenCredentialsAreValid() {
        UserLoginDto dto = new UserLoginDto("alice@example.com", "correct_password");
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("correct_password", "$2a$10$hashed_password")).thenReturn(true);
        when(jwtUtil.generateToken("alice@example.com")).thenReturn("valid.jwt.token");
        when(jwtUtil.expiresAt("valid.jwt.token")).thenReturn(LocalDateTime.now().plusHours(1));

        AuthResponseDto result = authService.login(dto);

        assertThat(result.token()).isEqualTo("valid.jwt.token");
        assertThat(result.username()).isEqualTo("alice");
    }

    @Test
    void login_throwsInvalidCredentialsException_whenEmailIsNotFound() {
        UserLoginDto dto = new UserLoginDto("ghost@example.com", "anypassword");
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(dto))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void login_throwsInvalidCredentialsException_whenPasswordIsWrong() {
        UserLoginDto dto = new UserLoginDto("alice@example.com", "wrong_password");
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("wrong_password", "$2a$10$hashed_password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(dto))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(jwtUtil, never()).generateToken(any());
    }
}
