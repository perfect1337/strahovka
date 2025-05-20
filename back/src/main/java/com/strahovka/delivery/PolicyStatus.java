package com.strahovka.delivery;

public enum PolicyStatus {
    ACTIVE("Активный"),
    SUSPENDED("Приостановлен"),
    EXPIRED("Истек"),
    CANCELLED("Отменен");

    private final String displayName;

    PolicyStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 