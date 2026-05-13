package ru.doceum.modules.documents;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@ComponentScan(basePackageClasses = DocumentsModuleConfig.class)
@EntityScan(basePackageClasses = DocumentsModuleConfig.class)
@EnableJpaRepositories(basePackageClasses = DocumentsModuleConfig.class)
public class DocumentsModuleConfig {
}