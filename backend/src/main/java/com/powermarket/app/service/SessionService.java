package com.powermarket.app.service;

import com.powermarket.app.entity.UserRole;
import com.powermarket.app.entity.UserSession;
import com.powermarket.app.repository.UserSessionRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SessionService {
    
    private final UserSessionRepository sessionRepository;
    private static final String ROLE_ATTRIBUTE = "USER_ROLE";
    
    @Transactional
    public UserSession setRole(HttpSession httpSession, UserRole role) {
        String sessionId = httpSession.getId();
        
        UserSession userSession = sessionRepository.findById(sessionId)
                .orElse(new UserSession());
        
        userSession.setSessionId(sessionId);
        userSession.setRole(role);
        
        userSession = sessionRepository.save(userSession);
        httpSession.setAttribute(ROLE_ATTRIBUTE, role.name());
        
        return userSession;
    }
    
    public Optional<UserRole> getRole(HttpSession httpSession) {
        String roleStr = (String) httpSession.getAttribute(ROLE_ATTRIBUTE);
        if (roleStr != null) {
            return Optional.of(UserRole.valueOf(roleStr));
        }
        
        String sessionId = httpSession.getId();
        return sessionRepository.findById(sessionId)
                .map(UserSession::getRole);
    }
    
    @Transactional
    public void clearRole(HttpSession httpSession) {
        httpSession.removeAttribute(ROLE_ATTRIBUTE);
        String sessionId = httpSession.getId();
        sessionRepository.deleteById(sessionId);
    }
}
