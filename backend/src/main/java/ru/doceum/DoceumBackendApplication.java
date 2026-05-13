package ru.doceum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;
import ru.doceum.modules.auth.AuthModuleConfig;
import ru.doceum.modules.documents.DocumentsModuleConfig;

@SpringBootApplication
@Import({
        AuthModuleConfig.class,
        DocumentsModuleConfig.class
})
public class DoceumBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(DoceumBackendApplication.class, args);
    }
}