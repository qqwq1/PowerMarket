package org.dev.powermarket.service.mapper;

import org.dev.powermarket.domain.User;
import org.dev.powermarket.service.dto.UserDto;
import org.springframework.stereotype.Component;

/**
 * Маппер для преобразования User entity в UserDto
 */
@Component
public class UserMapper {

    /**
     * Преобразует User entity в UserDto
     */
    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }

        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getFullName(),
                user.getCompanyName(),
                user.getInn(),
                user.getPhone(),
                user.getAddress(),
                user.getCreatedAt()
        );
    }
}
