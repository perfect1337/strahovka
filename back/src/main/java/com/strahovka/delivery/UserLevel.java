package com.strahovka.delivery;

import lombok.Getter;

@Getter
public enum UserLevel {
    WOODEN(0, 0, 0),
    BRONZE(1, 5, 1),
    SILVER(2, 10, 2),
    GOLD(3, 20, 3),
    PLATINUM(4, 30, 5);

    private final int level;
    private final int requiredPolicies;
    private final int cashbackPercentage;

    UserLevel(int level, int requiredPolicies, int cashbackPercentage) {
        this.level = level;
        this.requiredPolicies = requiredPolicies;
        this.cashbackPercentage = cashbackPercentage;
    }

    public static UserLevel getLevelByPolicyCount(int policyCount) {
        if (policyCount >= PLATINUM.requiredPolicies) return PLATINUM;
        if (policyCount >= GOLD.requiredPolicies) return GOLD;
        if (policyCount >= SILVER.requiredPolicies) return SILVER;
        if (policyCount >= BRONZE.requiredPolicies) return BRONZE;
        return WOODEN;
    }
} 