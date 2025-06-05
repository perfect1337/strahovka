package com.strahovka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.strahovka")
@EntityScan("com.strahovka.entity")
public class StrahovkaApplication {
    public static void main(String[] args) {
        SpringApplication.run(StrahovkaApplication.class, args);
    }
}