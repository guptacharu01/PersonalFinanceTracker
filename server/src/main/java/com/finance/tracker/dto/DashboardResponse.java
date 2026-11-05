package com.finance.tracker.dto;

import com.finance.tracker.model.Transaction;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal balance,
        List<CategoryTotal> categoryExpenses,
        List<MonthlyTotal> monthly,
        List<Transaction> recentTransactions) {
    public record CategoryTotal(String category, BigDecimal amount) {}
    public record MonthlyTotal(String month, BigDecimal income, BigDecimal expense) {}
}
