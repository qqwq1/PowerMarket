
package org.dev.powermarket.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret:}")
    private String jwtSecret;

    @Value("${app.jwt.expiration:3600000}")
    private long jwtExpirationMs;

    public String generateAccessToken(String email, UUID userId, String role) {
        Map<String, Object> claims = new HashMap<>();
        if (userId != null) {
            claims.put("uid", userId.toString());
        }
        if (role != null) {
            claims.put("role", role);
        }
        return Jwts.builder()
                .setSubject(email)
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String email) {
        long refreshMs = jwtExpirationMs * 2;
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public long getAccessTokenValiditySeconds() {
        return jwtExpirationMs / 1000;
    }

    private Key key() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            byte[] rand = new byte[32];
            for (int i = 0; i < rand.length; i++) rand[i] = (byte) (Math.random() * 256);
            return Keys.hmacShaKeyFor(rand);
        }
        try {
            byte[] decoded = Decoders.BASE64.decode(jwtSecret);
            return Keys.hmacShaKeyFor(decoded);
        } catch (Exception e) {
            byte[] bytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            if (bytes.length < 32) {
                try {
                    bytes = MessageDigest.getInstance("SHA-256").digest(bytes);
                } catch (NoSuchAlgorithmException ex) {
                    throw new RuntimeException(ex);
                }
            }
            return Keys.hmacShaKeyFor(bytes);
        }
    }
}
