package org.dev.powermarket.service.dto;

public class AuthResponse {
    private String tokens;
    private UserDto user;

    public AuthResponse() {}

    public AuthResponse(String tokens, UserDto user) {
        this.tokens = tokens;
        this.user = user;
    }

    public String getTokens() { return tokens; }
    public void setTokens(String tokens) { this.tokens = tokens; }
    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }


}
