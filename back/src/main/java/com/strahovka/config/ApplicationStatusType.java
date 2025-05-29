package com.strahovka.config;

import com.strahovka.entity.ApplicationStatus;

public class ApplicationStatusType extends PostgreSQLEnumType<ApplicationStatus> {
    public ApplicationStatusType() {
        setEnumClass(ApplicationStatus.class);
    }
} 