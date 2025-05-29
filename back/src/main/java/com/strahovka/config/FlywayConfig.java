package com.strahovka.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class FlywayConfig {

    @Autowired
    private DataSource dataSource;

    @Bean(initMethod = "migrate")
    public Flyway flyway() {
        return Flyway.configure()
                .dataSource(dataSource)
                .baselineOnMigrate(true)
                .outOfOrder(true)
                .validateOnMigrate(false)
                .cleanDisabled(false)
                .locations("classpath:db/migration")
                .ignoreMigrationPatterns("*:ignored")
                .placeholderReplacement(false)
                .mixed(true)
                .validateMigrationNaming(false)
                .load();
    }
} 