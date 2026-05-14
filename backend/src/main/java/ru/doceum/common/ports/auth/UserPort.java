package ru.doceum.common.ports.auth;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserPort {
    Optional<UserInfo> getUserInfo(UUID userId);
    List<UserInfo> findUsersByFullNameLike(String query);
}
