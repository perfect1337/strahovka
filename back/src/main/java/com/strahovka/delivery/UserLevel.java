package com.strahovka.delivery;

public enum UserLevel {
    WOODEN(0, 0, "Деревянный"),
    BRONZE(1, 5, "Бронзовый"),
    SILVER(2, 10, "Серебряный"),
    GOLD(3, 15, "Золотой");

    private final int requiredPolicies;
    private final int cashbackPercentage;
    private final String displayName;

    UserLevel(int requiredPolicies, int cashbackPercentage, String displayName) {
        this.requiredPolicies = requiredPolicies;
        this.cashbackPercentage = cashbackPercentage;
        this.displayName = displayName;
    }

    public int getRequiredPolicies() {
        return requiredPolicies;
    }

    public int getCashbackPercentage() {
        return cashbackPercentage;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static UserLevel getLevelByPolicyCount(int policyCount) {
        if (policyCount >= 3) return GOLD;
        if (policyCount >= 2) return SILVER;
        if (policyCount >= 1) return BRONZE;
        return WOODEN;
    }
} 