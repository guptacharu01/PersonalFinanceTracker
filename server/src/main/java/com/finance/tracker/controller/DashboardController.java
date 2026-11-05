package com.finance.tracker.controller;

import com.finance.tracker.dto.DashboardResponse;
import com.finance.tracker.model.User;
import com.finance.tracker.service.TransactionService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final TransactionService service;

    public DashboardController(TransactionService service) {
        this.service = service;
    }

    @GetMapping
    public DashboardResponse summary(@AuthenticationPrincipal User user) {
        return service.summary(user.getId());
    }
}
