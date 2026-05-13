package ru.doceum.modules.auth.infrastructure.port;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.doceum.common.ports.auth.UserInfo;
import ru.doceum.common.ports.auth.UserPort;
import ru.doceum.modules.auth.domain.repositories.UserRepository;
import ru.doceum.modules.auth.domain.valueobjects.Email;

import java.util.Optional;
import java.util.UUID;

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
}