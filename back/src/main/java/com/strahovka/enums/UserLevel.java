package com.strahovka.enums;

import lombok.Getter;

@Getter
public enum UserLevel {
    WOODEN(0, 0, 2),
    BRONZE(1, 1, 5),
    SILVER(2, 3, 10),
    GOLD(3, 5, 15);

    private final int level;
    private final int requiredPolicies;
    private final int cashbackPercentage;

    UserLevel(int level, int requiredPolicies, int cashbackPercentage) {
        this.level = level;
        this.requiredPolicies = requiredPolicies;
        this.cashbackPercentage = cashbackPercentage;
    }

    public static UserLevel getLevelByPolicyCount(int policyCount) {
        if (policyCount >= GOLD.requiredPolicies) return GOLD;
        if (policyCount >= SILVER.requiredPolicies) return SILVER;
        if (policyCount >= BRONZE.requiredPolicies) return BRONZE;
        return WOODEN;
    }
} 