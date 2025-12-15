package org.dev.powermarket.service;

import org.dev.powermarket.domain.User;
import org.dev.powermarket.domain.enums.Role;
import org.dev.powermarket.repository.UserRepository;
import org.dev.powermarket.security.jwt.UserPrincipal;
import org.dev.powermarket.service.dto.*;
import org.dev.powermarket.service.mapper.UserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Сервис для аутентификации и регистрации пользователей
 */
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider jwtTokenProvider,
            UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userMapper = userMapper;
    }

    /**
     * Регистрация нового пользователя
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        logger.info("Registering new user with email: {}", request.getEmail());

        // Валидация email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Валидация ИНН
        if (userRepository.existsByInn(request.getInn())) {
            throw new IllegalArgumentException("INN already registered");
        }

        // Валидация роли
        if (request.getRole() != Role.SUPPLIER && request.getRole() != Role.TENANT) {
            throw new IllegalArgumentException("Invalid role. Only SUPPLIER and TENANT roles are allowed for registration");
        }

        // Создание пользователя
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setFullName(request.getFullName());
        user.setCompanyName(request.getCompanyName());
        user.setInn(request.getInn());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        User savedUser = userRepository.save(user);
        System.out.println(request);
        System.out.println(savedUser);
        logger.info("User registered successfully with ID: {}", savedUser.getId());

        // Генерация токенов
        AuthTokens tokens = generateTokens(savedUser);
        System.out.println(tokens);
        UserDto userDto = userMapper.toDto(savedUser);

        return new AuthResponse(tokens.getAccessToken(), userDto);
    }

    /**
     * Аутентификация пользователя
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        logger.info("Attempting login for email: {}", request.getEmail());

        try {
            // Аутентификация через Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // Получение пользователя
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

            logger.info("User logged in successfully: {}", user.getEmail());

            // Генерация токенов
            AuthTokens tokens = generateTokens(user);
            UserDto userDto = userMapper.toDto(user);
            System.out.println(tokens.getAccessToken());
            System.out.println(userDto.toString());

            return new AuthResponse(tokens.getAccessToken(), userDto);

        } catch (AuthenticationException e) {
            logger.warn("Failed login attempt for email: {}", request.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    public UserPrincipal loginUser(Authentication authentication){
        UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList();

        // Update last login
        User user = userRepository.findById(userDetails.id()).orElse(null);
        if (user != null) {
            userRepository.save(user);
        }

        return userDetails;
    }

//    /**
//     * Обновление токенов по refresh token
//     */
//    @Transactional(readOnly = true)
//    public AuthTokens refresh(RefreshRequest request) {
//        logger.info("Attempting to refresh tokens");
//
//        String refreshToken = request.getRefreshToken();
//
//        // Валидация refresh токена
//        if (!jwtTokenProvider.validateToken(refreshToken)) {
//            throw new JwtAuthenticationException("Invalid refresh token");
//        }
//
//        if (!jwtTokenProvider.isRefreshToken(refreshToken)) {
//            throw new JwtAuthenticationException("Provided token is not a refresh token");
//        }
//
//        // Извлечение email и получение пользователя
//        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() -> new BadCredentialsException("User not found"));
//
//        logger.info("Tokens refreshed successfully for user: {}", email);
//
//        // Генерация новых токенов
//        return generateTokens(user);
//    }

    /**
     * Получение информации о текущем пользователе
     */
    @Transactional(readOnly = true)
    public UserDto me(String email) {
        logger.debug("Fetching user info for email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        return userMapper.toDto(user);
    }

    /**
     * Генерация пары токенов для пользователя
     */
    private AuthTokens generateTokens(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getEmail(),
                user.getId(),
                user.getRole().name()
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());
        long expiresIn = jwtTokenProvider.getAccessTokenValiditySeconds();

        return new AuthTokens(accessToken, refreshToken, expiresIn);
    }
}
