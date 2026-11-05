package com.finance.tracker.controller;

import com.finance.tracker.dto.BudgetRequest;
import com.finance.tracker.dto.BudgetResponse;
import com.finance.tracker.model.Budget;
import com.finance.tracker.model.User;
import com.finance.tracker.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {
    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    @PostMapping
    public Budget setBudget(@AuthenticationPrincipal User user, @Valid @RequestBody BudgetRequest request) {
        return service.setBudget(user.getId(), request);
    }

    // Month defaults to the current month, e.g. ?month=2026-11
    @GetMapping
    public BudgetResponse getBudget(@AuthenticationPrincipal User user,
                                    @RequestParam(required = false) String month) {
        String selected = (month == null || month.isBlank()) ? YearMonth.now().toString() : month;
        return service.getBudget(user.getId(), selected);
    }
}
