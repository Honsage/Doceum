package ru.doceum.modules.auth.infrastructure.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final StringRedisTemplate redisTemplate;

    private static final String REFRESH_PREFIX = "refresh:";
    private static final String USER_TOKENS_PREFIX = "user_tokens:";
    private static final long REFRESH_TTL_SECONDS = 2592000L; // 30 дней

    public String createRefreshToken(String userId) {
        String token = generateToken();
        String tokenHash = hashToken(token);

        String refreshKey = REFRESH_PREFIX + tokenHash;
        String userTokensKey = USER_TOKENS_PREFIX + userId;

        // Сохраняем токен
        redisTemplate.opsForValue().set(refreshKey, userId, Duration.ofSeconds(REFRESH_TTL_SECONDS));

        // Добавляем в множество токенов пользователя
        redisTemplate.opsForSet().add(userTokensKey, tokenHash);
        redisTemplate.expire(userTokensKey, Duration.ofSeconds(REFRESH_TTL_SECONDS));

        return token;
    }

    public Optional<String> validateRefreshToken(String token) {
        String tokenHash = hashToken(token);
        String refreshKey = REFRESH_PREFIX + tokenHash;
        String userId = redisTemplate.opsForValue().get(refreshKey);
        return Optional.ofNullable(userId);
    }

    public void revokeRefreshToken(String token, String userId) {
        String tokenHash = hashToken(token);
        String refreshKey = REFRESH_PREFIX + tokenHash;
        String userTokensKey = USER_TOKENS_PREFIX + userId;

        redisTemplate.delete(refreshKey);
        redisTemplate.opsForSet().remove(userTokensKey, tokenHash);
    }

    public void revokeAllUserTokens(String userId) {
        String userTokensKey = USER_TOKENS_PREFIX + userId;
        Set<String> tokenHashes = redisTemplate.opsForSet().members(userTokensKey);

        if (tokenHashes != null) {
            tokenHashes.forEach(tokenHash -> {
                redisTemplate.delete(REFRESH_PREFIX + tokenHash);
            });
        }

        redisTemplate.delete(userTokensKey);
    }

    private String generateToken() {
        return UUID.randomUUID().toString() + UUID.randomUUID().toString();
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }
}