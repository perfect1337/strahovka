package com.strahovka.config;

import com.strahovka.enums.ApplicationStatus;

public class ApplicationStatusType extends PostgreSQLEnumType<ApplicationStatus> {
    public ApplicationStatusType() {
        setEnumClass(ApplicationStatus.class);
    }
} 