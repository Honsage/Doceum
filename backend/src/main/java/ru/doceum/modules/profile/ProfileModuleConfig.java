package ru.doceum.modules.profile;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@ComponentScan(basePackageClasses = ProfileModuleConfig.class)
@EntityScan(basePackageClasses = ProfileModuleConfig.class)
@EnableJpaRepositories(basePackageClasses = ProfileModuleConfig.class)
public class ProfileModuleConfig {
}