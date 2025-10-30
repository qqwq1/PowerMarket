package org.dev.powermarket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;

/**
 * Разрешаем документацию OpenAPI/Swagger, не трогая ваш основной SecurityFilterChain.
 * Работает на Spring Security 6.x (Boot 3.x).
 */
@Configuration
public class SwaggerSecurityConfig {

    @Bean
    public WebSecurityCustomizer swaggerWebSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(
            "/v3/api-docs/**",
            "/swagger-ui.html",
            "/swagger-ui/**"
        );
    }
}
