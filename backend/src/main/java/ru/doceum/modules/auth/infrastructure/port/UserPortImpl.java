package ru.doceum.modules.auth.infrastructure.port;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.doceum.common.ports.auth.UserInfo;
import ru.doceum.common.ports.auth.UserPort;
import ru.doceum.modules.auth.domain.repositories.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserPortImpl implements UserPort {

    private final UserRepository userRepository;

    @Override
    public Optional<UserInfo> getUserInfo(UUID userId) {
        return userRepository.findById(userId)
                .map(user -> new UserInfo(
                        user.getId(),
                        user.getSurname() + " " + user.getName() +
                                (user.getPatronymic() != null ? " " + user.getPatronymic() : ""),
                        user.getEmail().value()
                ));
    }

    @Override
    public List<UserInfo> findUsersByFullNameLike(String query) {
        // Поиск по фамилии, имени, отчеству (частичное совпадение)
        return userRepository.findByFullNameContaining(query)
                .stream()
                .map(user -> new UserInfo(
                        user.getId(),
                        user.getSurname() + " " + user.getName() +
                                (user.getPatronymic() != null ? " " + user.getPatronymic() : ""),
                        user.getEmail().value()
                ))
                .collect(Collectors.toList());
    }
}