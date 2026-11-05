package com.finance.tracker.repository;

import com.finance.tracker.model.Budget;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface BudgetRepository extends MongoRepository<Budget, String> {
    Optional<Budget> findByUserIdAndMonth(String userId, String month);
}
