package com.finance.tracker.dto;

import java.math.BigDecimal;

public record BudgetResponse(
        String month,
        BigDecimal budgetAmount, // null when no budget is set for this month yet
        BigDecimal spent,        // total expenses in this month
        BigDecimal remaining,    // null when no budget is set
        boolean overBudget) {}
