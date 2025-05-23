package com.strahovka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "com.strahovka")
@EntityScan("com.strahovka.delivery")
@EnableJpaRepositories("com.strahovka.repository")
public class    StrahovkaApplication {
    public static void main(String[] args) {
        SpringApplication.run(StrahovkaApplication.class, args);
    }
} 