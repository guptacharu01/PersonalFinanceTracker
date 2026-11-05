package com.finance.tracker.service;

import com.finance.tracker.dto.DashboardResponse;
import com.finance.tracker.dto.TransactionRequest;
import com.finance.tracker.model.Transaction;
import com.finance.tracker.repository.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
public class TransactionService {
    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    public Transaction create(String userId, TransactionRequest request) {
        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setTitle(request.title());
        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setCategory(request.category());
        transaction.setDate(request.date());
        transaction.setNotes(request.notes());
        return repository.save(transaction);
    }

    // Filters are applied in memory after scoping to this user only.
    // This keeps the code simple for a personal tracker; the user scope is never skipped.
    public List<Transaction> list(String userId, String type, String category, LocalDate date) {
        return repository.findByUserId(userId).stream()
                .filter(t -> type == null || type.isBlank() || t.getType().equals(type))
                .filter(t -> category == null || category.isBlank() || t.getCategory().equalsIgnoreCase(category))
                .filter(t -> date == null || t.getDate().equals(date))
                .sorted(Comparator.comparing(Transaction::getDate).reversed()
                        .thenComparing(Comparator.comparing(Transaction::getCreatedAt).reversed()))
                .toList();
    }

    public void delete(String userId, String id) {
        Transaction transaction = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        repository.delete(transaction);
    }

    public DashboardResponse summary(String userId) {
        List<Transaction> all = repository.findByUserId(userId);
        BigDecimal income = sum(all, "INCOME");
        BigDecimal expense = sum(all, "EXPENSE");

        // Pie chart: expenses grouped by category, largest first.
        List<DashboardResponse.CategoryTotal> byCategory = all.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .collect(Collectors.groupingBy(Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)))
                .entrySet().stream()
                .map(e -> new DashboardResponse.CategoryTotal(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(DashboardResponse.CategoryTotal::amount).reversed())
                .toList();

        // Bar chart: income vs expense per month (YYYY-MM), oldest month first.
        Map<String, BigDecimal[]> perMonth = new TreeMap<>();
        for (Transaction t : all) {
            String month = YearMonth.from(t.getDate()).toString();
            BigDecimal[] totals = perMonth.computeIfAbsent(month, k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            if ("INCOME".equals(t.getType())) totals[0] = totals[0].add(t.getAmount());
            else totals[1] = totals[1].add(t.getAmount());
        }
        List<DashboardResponse.MonthlyTotal> monthly = perMonth.entrySet().stream()
                .map(e -> new DashboardResponse.MonthlyTotal(e.getKey(), e.getValue()[0], e.getValue()[1]))
                .toList();

        List<Transaction> recent = all.stream()
                .sorted(Comparator.comparing(Transaction::getDate).reversed()
                        .thenComparing(Comparator.comparing(Transaction::getCreatedAt).reversed()))
                .limit(5)
                .toList();

        return new DashboardResponse(income, expense, income.subtract(expense), byCategory, monthly, recent);
    }

    private BigDecimal sum(List<Transaction> transactions, String type) {
        return transactions.stream()
                .filter(t -> type.equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
