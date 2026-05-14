package ru.doceum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;
import ru.doceum.modules.auth.AuthModuleConfig;
import ru.doceum.modules.documents.DocumentsModuleConfig;
import ru.doceum.modules.hub.HubModuleConfig;
import ru.doceum.modules.profile.ProfileModuleConfig;

@SpringBootApplication
@Import({
        AuthModuleConfig.class,
        DocumentsModuleConfig.class,
        HubModuleConfig.class,
        ProfileModuleConfig.class
})
public class DoceumBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(DoceumBackendApplication.class, args);
    }
}