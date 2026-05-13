package ru.doceum.common.ports.auth;

import java.util.Optional;
import java.util.UUID;

public interface UserPort {
    Optional<UserInfo> getUserInfo(UUID userId);
}

