package org.dev.powermarket.service;

import org.dev.powermarket.security.entity.User;
import org.dev.powermarket.security.repository.AuthorizedUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private AuthorizedUserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private UUID userId;
    private String email;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        email = "user@test.com";
    }

    @Test
    void getUserIdByEmail_WhenUserExists_ReturnsId() {
        User user = new User();
        user.setId(userId);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        UUID result = userService.getUserIdByEmail(email);

        assertThat(result).isEqualTo(userId);
    }

    @Test
    void getUserIdByEmail_WhenUserMissing_ThrowsException() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserIdByEmail(email))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found");
    }
}
