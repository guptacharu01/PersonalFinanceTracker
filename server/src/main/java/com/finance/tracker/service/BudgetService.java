package com.finance.tracker.service;

import com.finance.tracker.dto.BudgetRequest;
import com.finance.tracker.dto.BudgetResponse;
import com.finance.tracker.model.Budget;
import com.finance.tracker.model.Transaction;
import com.finance.tracker.repository.BudgetRepository;
import com.finance.tracker.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;

@Service
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    public BudgetService(BudgetRepository budgetRepository, TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
    }

    // One budget per user per month: saving again for the same month updates it.
    public Budget setBudget(String userId, BudgetRequest request) {
        Budget budget = budgetRepository.findByUserIdAndMonth(userId, request.month())
                .orElseGet(Budget::new);
        budget.setUserId(userId);
        budget.setMonth(request.month());
        budget.setAmount(request.amount());
        budget.setUpdatedAt(Instant.now());
        return budgetRepository.save(budget);
    }

    public BudgetResponse getBudget(String userId, String month) {
        BigDecimal spent = transactionRepository.findByUserId(userId).stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .filter(t -> YearMonth.from(t.getDate()).toString().equals(month))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return budgetRepository.findByUserIdAndMonth(userId, month)
                .map(b -> new BudgetResponse(month, b.getAmount(), spent,
                        b.getAmount().subtract(spent), spent.compareTo(b.getAmount()) >= 0))
                .orElse(new BudgetResponse(month, null, spent, null, false));
    }
}
